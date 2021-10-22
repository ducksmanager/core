<template>
  <div>
    <b-jumbotron v-if="!username">
      <div id="dm-loves-inducks">
        <div
          id="dm-logo-small"
          :style="{backgroundImage: `url(${imagePath}/logo_small.png)`}"
        >
          &nbsp;
        </div>
        <div
          id="loves"
          :style="{backgroundImage: `url(${imagePath}/icons/heart.png)`}"
        >
          &nbsp;
        </div>
        <div
          id="inducks-logo"
          :style="{backgroundImage: `url(${imagePath}/inducks_logo.png)`}"
        >
          &nbsp;
        </div>
      </div>
      <p>
        {{ $t("DucksManager utilise la base de données Inducks pour lister les numéros référencés pour chacun des magazines Disney.")
        }}
      </p>
      <p>
        <span
          v-html="$t(`Si vous possédez déjà une collection Inducks, vous pouvez <b>l'importer sur DucksManager en quelques clics.</b>`)"
        /><br>
        {{ $t("Pour cela, créez une nouvelle collection DucksManager ou connectez-vous à votre collection DucksManager existante, puis sélectionnez \"{0}\" dans le menu.", [$t("Collection Inducks")])
        }}
      </p>
      <p>
        <b-button
          size="lg"
          variant="primary"
          :href="$r('/signup')"
        >
          {{ $t("Inscription") }}
        </b-button>
        <b-button
          size="lg"
          variant="primary"
          :href="$r('/login')"
        >
          {{ $t("Connexion") }}
        </b-button>
      </p>
    </b-jumbotron>
    <form
      v-else-if="step === 1"
      id="inducks-import"
      method="post"
      action=""
    >
      <b-alert
        show
        variant="info"
      >
        <div>{{ $t("Cette page vous permet d'importer votre collection Inducks dans DucksManager.") }}</div>
        {{ $t("Pour cela, suivez les étapes suivantes :") }}
        <ol>
          <li>{{ $t("Sur l'écran de gauche, connectez-vous, si ce n'est déjà fait, sur Inducks.") }}</li>
          <li
            v-html="$t(`Une fois connecté(e), vous parviendrez sur une page contenant votre collection sous forme d'une liste commençant par : <pre>country^entrycode^collectiontype^comment</pre>`)"
          />
          <li>{{ $t("Sélectionnez toute la liste, puis copiez-la.") }}</li>
          <li>{{ $t("Collez ce texte dans la partie droite de la page.") }}</li>
          <li>{{ $t(`Cliquez sur le bouton "Importer" en bas de la page.`) }}</li>
        </ol>
      </b-alert>
      <b-row class="justify-content-center">
        <b-col sm="6">
          <iframe src="https://inducks.org/collection.php?rawOutput=1" />
        </b-col>
        <b-col sm="6">
          <b-form-group>
            <b-textarea
              id="inducks-collection"
              v-model="rawData"
            />
          </b-form-group>
          <b-button
            @click="processRawData()"
            v-text="$t('Importer')"
          />
        </b-col>
      </b-row>
    </form>
    <template v-else-if="step === 2">
      <b-alert
        v-if="issuesImportable"
        show
        variant="info"
      >
        <div>{{ issuesImportable.length }} {{ $t("numéros peuvent être importés.") }}</div>
        <div
          v-if="hasPublicationNames"
          role="tablist"
        >
          <Accordion
            v-for="(issues, publicationCode) in groupByPublicationCode(issuesImportable)"
            :id="publicationCode"
            :key="publicationCode"
            :visible="expandedPublicationAccordion === publicationCode"
            accordion-group-id="import-accordion"
            @bv::toggle::collapse="expandedPublicationAccordion = publicationCode"
          >
            <template #header>
              <Publication
                :publicationcode="publicationCode"
                :publicationname="publicationNames[publicationCode]"
              />
              x {{ issues.length }}
            </template>
            <template #content>
              <div
                v-for="issue in issues"
                :key="issue"
              >
                {{ ucFirst($t("numéro")) }} {{ issue }}
              </div>
            </template>
          </Accordion>
          <b-collapse visible />
        </div>
      </b-alert>
      <b-alert
        v-if="issuesNotReferenced && issuesNotReferenced.length || issuesAlreadyInCollection && issuesAlreadyInCollection.length"
        show
        variant="warning"
      >
        <template v-if="issuesAlreadyInCollection && issuesAlreadyInCollection.length">
          <div>
            {{ issuesAlreadyInCollection.length }}
            {{ $t("numéros ne peuvent pas être importés car vous les possédez déjà dans votre collection.") }}
          </div>
          <Accordion
            id="already-in-collection"
            accordion-group-id="import-accordion-not-importable"
            :visible="expandedNotImportableAccordion === 'already-in-collection'"
            @bv::toggle::collapse="expandedNotImportableAccordion = 'already-in-collection'"
          >
            <template #header>
              {{ $t("Numéros déjà dans la collection") }}
            </template>
            <template #content>
              <div
                v-for="(issueNumbers, publicationCode) in groupByPublicationCode(issuesAlreadyInCollection)"
                :key="publicationCode"
              >
                <div
                  v-for="issueNumber in issueNumbers"
                  :key="`${publicationCode}-${issueNumber}`"
                >
                  <Issue
                    :publicationcode="publicationCode"
                    :publicationname="publicationNames[publicationCode]"
                    :issuenumber="issueNumber"
                  />
                </div>
              </div>
            </template>
          </Accordion>
        </template>
        <template v-if="issuesNotReferenced && issuesNotReferenced.length">
          <div>
            {{ issuesNotReferenced.length }}
            {{ $t("numéros ne peuvent pas être importés car ils n'existent plus sur Inducks.") }}
          </div>
          <Accordion
            id="not-found"
            accordion-group-id="import-accordion-not-importable"
            :visible="expandedNotImportableAccordion === 'not-found'"
            @bv::toggle::collapse="expandedNotImportableAccordion = 'not-found'"
          >
            <template #header>
              {{ $t("Numéros non référencés") }}
            </template>
            <template #content>
              <div
                v-for="(issueNumbers, publicationCode) in groupByPublicationCode(issuesNotReferenced)"
                :key="publicationCode"
              >
                <Issue
                  v-for="issueNumber in issueNumbers"
                  :key="`${publicationCode}-${issueNumber}`"
                  :publicationcode="publicationCode"
                  :publicationname="publicationCode"
                  :issuenumber="issueNumber"
                />
              </div>
            </template>
          </Accordion>
        </template>
      </b-alert>
      <template v-if="issuesImportable && issuesImportable.length">
        <b-form-group>
          <label for="condition">{{ $t("Etat") }}</label>
          <b-form-select
            id="condition"
            v-model="issueDefaultCondition"
            class="mb-3"
          >
            <template #first>
              <b-form-select-option
                :value="null"
                disabled
              >
                {{ $t("Choisissez un état par défaut pour les nouveaux numéros") }}
              </b-form-select-option>
            </template>

            <b-form-select-option
              v-for="(conditionText, conditionValue) in conditions"
              :key="conditionValue"
              :value="conditionValue"
            >
              {{ conditionText }}
            </b-form-select-option>
          </b-form-select>
        </b-form-group>
        <b-progress
          v-if="importProgress"
          height="2rem"
        >
          <b-progress-bar
            :value="importProgress"
            :label="`${parseInt(importProgress)}%`"
          />
        </b-progress>
        <b-button
          v-else
          @click="importIssues"
        >
          {{ $t("Importer") }} {{ issuesImportable.length }} {{ $tc("numéro | numéros", issuesImportable.length) }}
        </b-button>
      </template>
    </template>
  </div>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import { mapActions, mapState } from "vuex";
import Accordion from "../components/Accordion";
import Publication from "../components/Publication";
import collectionMixin from "../mixins/collectionMixin";
import Issue from "../components/Issue";
import axios from "axios";
import {
  BAlert,
  BButton,
  BCol,
  BCollapse,
  BFormGroup, BFormSelect,
  BFormSelectOption, BFormTextarea,
  BJumbotron,
  BProgress,
  BProgressBar,
  BRow
} from "bootstrap-vue";

export default {
  name: "InducksImport",
  components: { Accordion, Publication, Issue, BJumbotron, BButton, BAlert, BRow, BCol, BFormGroup, BTextarea: BFormTextarea, BCollapse, BFormSelect, BFormSelectOption, BProgress, BProgressBar},
  mixins: [l10nMixin, collectionMixin],

  data: () => ({
    step: 1,
    rawData: "",
    expandedPublicationAccordion: null,
    expandedNotImportableAccordion: null,
    hasPublicationNames: false,
    hasIssueNumbers: false,
    issueDefaultCondition: "bon",
    issuesToImport: null,
    issuesNotReferenced: null,
    issuesAlreadyInCollection: null,
    issuesImportable: null,
    importProgress: 0
  }),

  computed: {
    ...mapState("coa", ["publicationNames", "issueNumbers", "issueCodeDetails"]),

    conditions() {
      return {
        mauvais: this.$t("En mauvais état"),
        bon: this.$t("En bon état")
      };
    },

    importDataReady() {
      return this.issuesToImport && this.collection && this.hasIssueNumbers;
    }
  },

  watch: {
    importDataReady(newValue) {
      if (newValue) {
        const vm = this;
        vm.issuesNotReferenced = [];
        vm.issuesAlreadyInCollection = [];
        vm.issuesImportable = [];
        this.issuesToImport.forEach(issue => {
          const { publicationcode, issuenumber } = issue;
          if (!vm.issueNumbers[publicationcode].includes(issuenumber.replace(/[ ]+/g, ' '))) {
            vm.issuesNotReferenced.push(issue);
          } else if (vm.findInCollection(publicationcode, issuenumber)) {
            vm.issuesAlreadyInCollection.push(issue);
          } else {
            vm.issuesImportable.push(issue);
          }
        });
        this.issuesNotReferenced = [...new Set(this.issuesNotReferenced)];
        this.issuesAlreadyInCollection = [...new Set(this.issuesAlreadyInCollection)];
        this.issuesImportable = [...new Set(this.issuesImportable)];
      }
    },
    async issuesToImport(newValue) {
      const publicationCodes = newValue.reduce((acc, { publicationcode }) => [...acc, publicationcode], []);
      await this.fetchPublicationNames(publicationCodes);
      this.hasPublicationNames = true;
      await this.fetchIssueNumbers(publicationCodes);
      this.hasIssueNumbers = true;
    }
  },

  methods: {
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueNumbers", "fetchIssueCodesDetails"]),
    async processRawData() {
      const vm = this;
      const REGEX_VALID_ROW = /^([^^]+\^[^^]+)\^/;
      const issueCodes = this.rawData
        .split("\n")
        .filter(row => !/^country/.test(row) && REGEX_VALID_ROW.test(row))
        .map(row => row.match(REGEX_VALID_ROW)[1].replace("^", "/"));
      await this.fetchIssueCodesDetails(issueCodes);

      const issues = issueCodes
        .filter(issueCode => vm.issueCodeDetails[issueCode])
        .reduce((acc, issueCode) => ([
          ...acc,
          vm.issueCodeDetails[issueCode]
        ]), []);
      if (issues.length) {
        this.issuesToImport = issues;
        this.step = 2;
      }
    },

    groupByPublicationCode(issues) {
      return issues && issues.reduce((acc, { publicationcode, issuenumber }) => ({
        ...acc,
        [publicationcode]: [...new Set([...(acc[publicationcode] || []), issuenumber.replace(" ", "")])]
      }), {});
    },

    async importIssues() {
      const importableIssuesByPublicationCode = this.groupByPublicationCode(this.issuesImportable);
      for (let publicationCode in importableIssuesByPublicationCode) {
        if (importableIssuesByPublicationCode.hasOwnProperty(publicationCode)) {
          await axios.post("/api/collection/issues", {
            publicationCode: publicationCode,
            issueNumbers: importableIssuesByPublicationCode[publicationCode],
            condition: this.issueDefaultCondition,
            istosell: "do_not_change",
            purchaseId: "do_not_change"
          });
          this.importProgress += 100 / Object.keys(importableIssuesByPublicationCode).length;
        }
      }
      window.location.replace(this.$r("/collection/show"));
    }
  }
};
</script>

<style scoped lang="scss">

.jumbotron {
  background: white;
  color: black;

  #dm-loves-inducks {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 350px;
  }

  #dm-logo-small {
    width: 100px;
    height: 30px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position-y: center;
  }

  #loves {
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position-y: center;
  }

  #inducks-logo {
    width: 100px;
    height: 30px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position-y: center;
  }

  p {
    font-size: 14px;
    line-height: 25px;
  }
}

iframe, textarea {
  height: 400px !important;
  width: 100%;
}

iframe {
  border: 0;
}

pre {
  padding: 2px;
  display: inline;
}

li {
  cursor: initial;
}
</style>
