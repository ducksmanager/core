<template>
  <div v-if="l10n">
    <form
      v-if="step === 1"
      id="inducks-import"
      method="post"
      action=""
    >
      <b-alert
        show
        variant="info"
      >
        <div>{{ l10n.IMPORTER_INDUCKS_INSTRUCTIONS_1 }}</div>
        {{ l10n.IMPORTER_INDUCKS_INSTRUCTIONS_2 }}
        <ol>
          <li>{{ l10n.IMPORTER_INDUCKS_INSTRUCTIONS_3 }}</li>
          <li v-html="l10n.IMPORTER_INDUCKS_INSTRUCTIONS_4" />
          <li>{{ l10n.IMPORTER_INDUCKS_INSTRUCTIONS_5 }}</li>
          <li>{{ l10n.IMPORTER_INDUCKS_INSTRUCTIONS_6 }}</li>
          <li>{{ l10n.IMPORTER_INDUCKS_INSTRUCTIONS_7 }}</li>
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
          <b-btn
            @click="processRawData()"
            v-text="l10n.IMPORTER"
          />
        </b-col>
      </b-row>
    </form>
    <template v-if="step === 2">
      <b-alert
        v-if="issuesImportable"
        show
        variant="info"
      >
        <div>{{ issuesImportable.length }} {{ l10n.IMPORTER_INDUCKS_NUMEROS_A_IMPORTER }}</div>
        <div
          v-if="publicationNames"
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
                {{ ucFirst(l10n.NUMERO) }} {{ issue }}
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
          <div>{{ issuesAlreadyInCollection.length }} {{ l10n.IMPORTER_INDUCKS_NUMEROS_EXISTANTS }}</div>
          <Accordion
            id="already-in-collection"
            accordion-group-id="import-accordion-not-importable"
            :visible="expandedNotImportableAccordion === 'already-in-collection'"
            @bv::toggle::collapse="expandedNotImportableAccordion = 'already-in-collection'"
          >
            <template #header>
              Numéros déjà dans la collection
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
          <div>{{ issuesNotReferenced.length }} {{ l10n.IMPORTER_INDUCKS_NUMEROS_NON_REFERENCES }}</div>
          <Accordion
            id="not-found"
            accordion-group-id="import-accordion-not-importable"
            :visible="expandedNotImportableAccordion === 'not-found'"
            @bv::toggle::collapse="expandedNotImportableAccordion = 'not-found'"
          >
            <template #header>
              Numéros non référencés
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
      <b-form-group>
        <label for="condition">{{ l10n.ETAT }}</label>
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
              {{ l10n.IMPORTER_INDUCKS_ETAT }}
            </b-form-select-option>
          </template>

          <b-form-select-option
            v-for="(conditionTextKey, conditionValue) in conditions"
            :key="conditionValue"
            :value="conditionValue"
          >
            {{ l10n[conditionTextKey] }}
          </b-form-select-option>
        </b-form-select>
      </b-form-group>
      <b-btn v-if="issuesImportable.length">
        {{ l10n.IMPORTER }} {{ issuesImportable.length }} {{ l10n.NUMEROS }}
      </b-btn>
    </template>
  </div>
</template>
<script>
import l10nMixin from "../mixins/l10nMixin";
import {mapActions, mapState} from "vuex";
import Accordion from "../components/Accordion";
import Publication from "../components/Publication";
import collectionMixin from "../mixins/collectionMixin";
import Issue from "../components/Issue";

export default {
  name: "InducksImport",
  components: {Accordion, Publication, Issue},
  mixins: [l10nMixin, collectionMixin],

  data: () => ({
    step: 1,
    rawData: '',
    expandedPublicationAccordion: null,
    expandedNotImportableAccordion: null,
    issueDefaultCondition: 'bon',
    issuesToImport: null,
    issuesNotReferenced: null,
    issuesAlreadyInCollection: null,
    issuesImportable: null,
    conditions: {
      mauvais: 'ETAT_MAUVAIS',
      bon: 'ETAT_BON',
    }
  }),

  computed: {
    ...mapState("coa", ["publicationNames", "issueNumbers"]),
    imagePath: () => window.imagePath,

    importDataReady() {
      return this.issuesToImport && this.collection && this.issueNumbers
    },
  },

  watch: {
    importDataReady(newValue) {
      if (newValue) {
        const vm = this
        vm.issuesNotReferenced = []
        vm.issuesAlreadyInCollection = []
        vm.issuesImportable = []
        this.issuesToImport.forEach(issue => {
          const {publicationCode, issueNumber} = issue
          if (!vm.issueNumbers[publicationCode].includes(issueNumber)) {
            vm.issuesNotReferenced.push(issue)
          }
          else if (vm.findInCollection(publicationCode, issueNumber)) {
            vm.issuesAlreadyInCollection.push(issue)
          }
          else {
            vm.issuesImportable.push(issue)
          }
        })
        this.issuesNotReferenced = [...new Set(this.issuesNotReferenced)]
        this.issuesAlreadyInCollection = [...new Set(this.issuesAlreadyInCollection)]
        this.issuesImportable = [...new Set(this.issuesImportable)]
      }
    },
    async issuesToImport(newValue) {
      const publicationCodes = newValue.reduce((acc, {publicationCode}) => [...acc, publicationCode], [])
      await this.fetchPublicationNames(publicationCodes)
      await this.fetchIssueNumbers(publicationCodes)
    }
  },

  methods: {
    ...mapActions("coa", ["fetchPublicationNames", "fetchIssueNumbers"]),
    processRawData() {
      const issues = this.rawData
          .split('\n')
          .filter(row => !/^country/.test(row) && /^([^^]+)\^([^^]+)\^/.test(row))
          .map(row => {
            const [, countryCode, magazineCodeAndIssueNumber] = row.match(/^([^^]+)\^([^^]+)\^/)
            const [, magazineCode, issueNumber] = magazineCodeAndIssueNumber.match(/^([^ ]+)[ ]+(.+)$/)
            return {
              publicationCode: `${countryCode}/${magazineCode}`,
              issueNumber
            }
          })
      if (issues.length) {
        this.issuesToImport = issues
        this.step = 2
      }
    },

    groupByPublicationCode(issues) {
      return issues && issues.reduce((acc, issue) => ({
        ...acc,
        [issue.publicationCode]: [...new Set([...(acc[issue.publicationCode] || []), issue.issueNumber.replace(' ', '')])]
      }), {})
    }
  }
}
</script>

<style scoped lang="scss">

#inducks-import {
  iframe, textarea {
    height: 400px;
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
}
</style>