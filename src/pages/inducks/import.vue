<template>
  <div v-if="!user" id="wrapper" class="container-fluid py-5">
    <p class="col-md-8 fs-4" />
    <div id="dm-loves-inducks">
      <div
        id="dm-logo-small"
        :style="{ backgroundImage: `url(/images/logo_small.png)` }"
      >
        &nbsp;
      </div>
      <div
        id="loves"
        :style="{ backgroundImage: `url(/images/icons/heart.png)` }"
      >
        &nbsp;
      </div>
      <div
        id="inducks-logo"
        :style="{ backgroundImage: `url(/images/inducks_logo.png)` }"
      >
        &nbsp;
      </div>
    </div>
    <p>
      {{
        $t(
          "DucksManager utilise la base de données Inducks pour lister les numéros référencés pour chacun des magazines Disney."
        )
      }}
    </p>
    <p>
      <span
        v-html="
          $t(
            `Si vous possédez déjà une collection Inducks, vous pouvez <b>l'importer sur DucksManager en quelques clics.</b>`
          )
        "
      /><br />
      {{
        $t(
          'Pour cela, créez une nouvelle collection DucksManager ou connectez-vous à votre collection DucksManager existante, puis sélectionnez "{0}" dans le menu.',
          [$t("Collection Inducks")]
        )
      }}
    </p>
    <p>
      <router-link v-slot="{ href, navigate }" to="/signup" custom
        ><b-button
          class="mx-2"
          size="lg"
          variant="primary"
          :href="href"
          @click="navigate"
        >
          {{ $t("Inscription") }}
        </b-button>
      </router-link>
      <router-link v-slot="{ href, navigate }" to="/login" custom>
        <b-button
          class="mx-2"
          size="lg"
          variant="primary"
          :href="href"
          @click="navigate"
        >
          {{ $t("Connexion") }}
        </b-button></router-link
      >
    </p>
  </div>
  <form v-else-if="step === 1" id="inducks-import" method="post" action="">
    <b-alert show variant="info">
      <div>
        {{
          $t(
            "Cette page vous permet d'importer votre collection Inducks dans DucksManager."
          )
        }}
      </div>
      {{ $t("Pour cela, suivez les étapes suivantes :") }}
      <ol>
        <li>
          {{
            $t(
              "Sur l'écran de gauche, connectez-vous, si ce n'est déjà fait, sur Inducks."
            )
          }}
        </li>
        <li
          v-html="
            $t(
              `Une fois connecté(e), vous parviendrez sur une page contenant votre collection sous forme d'une liste commençant par : <pre>country^entrycode^collectiontype^comment</pre>`
            )
          "
        />
        <li>{{ $t("Sélectionnez toute la liste, puis copiez-la.") }}</li>
        <li>{{ $t("Collez ce texte dans la partie droite de la page.") }}</li>
        <li>
          {{ $t(`Cliquez sur le bouton "Importer" en bas de la page.`) }}
        </li>
      </ol>
    </b-alert>
    <b-row class="justify-content-center">
      <b-col sm="6">
        <iframe src="https://inducks.org/collection.php?rawOutput=1" />
      </b-col>
      <b-col sm="6">
        <b-form-group>
          <b-form-textarea id="inducks-collection" v-model="rawData" />
        </b-form-group>
        <b-button @click="processRawData()">
          {{ $t("Importer") }}
        </b-button>
      </b-col>
    </b-row>
  </form>
  <template v-else-if="step === 2">
    <b-alert v-if="issuesImportable" show variant="info">
      <div>
        {{ issuesImportable.length }}
        {{ $t("numéros peuvent être importés.") }}
      </div>
      <div v-if="hasPublicationNames" role="tablist">
        <Accordion
          v-for="(issues, publicationCode) in groupByPublicationCode(
            issuesImportable
          )"
          :id="publicationCode.replace('/', '-')"
          :key="publicationCode.replace('/', '-')"
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
            <div v-for="issue in issues" :key="issue">
              {{ $t("Numéro") }} {{ issue }}
            </div>
          </template>
        </Accordion>
        <b-collapse visible />
      </div>
    </b-alert>
    <b-alert
      v-if="issuesNotReferenced?.length || issuesAlreadyInCollection?.length"
      show
      variant="warning"
    >
      <template v-if="issuesAlreadyInCollection?.length">
        <div>
          {{ issuesAlreadyInCollection.length }}
          {{
            $t(
              "numéros ne peuvent pas être importés car vous les possédez déjà dans votre collection."
            )
          }}
        </div>
        <Accordion
          id="already-in-collection"
          accordion-group-id="import-accordion-not-importable"
          :visible="expandedNotImportableAccordion === 'already-in-collection'"
          @bv::toggle::collapse="
            expandedNotImportableAccordion = 'already-in-collection'
          "
        >
          <template #header>
            {{ $t("Numéros déjà dans la collection") }}
          </template>
          <template #content>
            <div
              v-for="(
                publicationIssueNumbers, publicationCode
              ) in groupByPublicationCode(issuesAlreadyInCollection)"
              :key="publicationCode"
            >
              <div
                v-for="issueNumber in publicationIssueNumbers"
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
      <template v-if="issuesNotReferenced?.length">
        <div>
          {{ issuesNotReferenced.length }}
          {{
            $t(
              "numéros ne peuvent pas être importés car ils n'existent plus sur Inducks."
            )
          }}
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
              v-for="(
                publicationIssueNumbers, publicationCode
              ) in groupByPublicationCode(issuesNotReferenced)"
              :key="publicationCode"
            >
              <Issue
                v-for="issueNumber in publicationIssueNumbers"
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
    <template v-if="issuesImportable?.length">
      <b-form-group>
        <label for="condition">{{ $t("Etat") }}</label>
        <b-form-select
          id="condition"
          v-model="issueDefaultCondition"
          class="mb-3"
        >
          <template #first>
            <b-form-select-option :value="null" disabled>
              {{
                $t("Choisissez un état par défaut pour les nouveaux numéros")
              }}
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
      <b-progress v-if="importProgress" height="2rem">
        <b-progress-bar
          :value="importProgress"
          :label="`${parseInt(importProgress)}%`"
        />
      </b-progress>
      <b-button v-else @click="importIssues">
        {{ $t("Importer") }} {{ issuesImportable.length }}
        {{ $t("numéro | numéros", issuesImportable.length) }}
      </b-button>
    </template>
  </template>
</template>

<script setup>
import axios from "axios";
import {
  BAlert,
  BButton,
  BCol,
  BCollapse,
  BFormGroup,
  BFormSelect,
  BFormSelectOption,
  BFormTextarea,
  BProgress,
  BProgressBar,
  BRow,
} from "bootstrap-vue-3";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";

let step = $ref(1);
const rawData = $ref("");
const expandedPublicationAccordion = $ref(null);
const expandedNotImportableAccordion = $ref(null);
let hasPublicationNames = $ref(false);
let hasIssueNumbers = $ref(false);
const issueDefaultCondition = $ref("bon");
let issuesToImport = $ref(null);
let issuesNotReferenced = $ref(null);
let issuesAlreadyInCollection = $ref(null);
let issuesImportable = $ref(null);
let importProgress = $ref(0);

const { t: $t } = useI18n();
const user = $computed(() => collectionStore().user);
const publicationNames = $computed(() => coa().publicationNames);
const issueNumbers = $computed(() => coa().issueNumbers);
const issueCodeDetails = $computed(() => coa().issueCodeDetails);
const conditions = {
  mauvais: $t("En mauvais état"),
  bon: $t("En bon état"),
};
const importDataReady = $computed(
  () => issuesToImport && collectionStore().collection && hasIssueNumbers
);
const router = useRouter();
const fetchPublicationNames = coa().fetchPublicationNames;
const fetchIssueNumbers = coa().fetchIssueNumbers;
const fetchIssueCodesDetails = coa().fetchIssueCodesDetails;
const processRawData = async () => {
  const REGEX_VALID_ROW = /^([^^]+\^[^^]+)\^/;
  const issueCodes = rawData
    .split("\n")
    .filter((row) => !/^country/.test(row) && REGEX_VALID_ROW.test(row))
    .map((row) => row.match(REGEX_VALID_ROW)[1].replace("^", "/"));
  await fetchIssueCodesDetails(issueCodes);

  const issues = issueCodes
    .filter((issueCode) => issueCodeDetails[issueCode])
    .reduce((acc, issueCode) => [...acc, issueCodeDetails[issueCode]], []);
  if (issues.length) {
    issuesToImport = issues;
    step = 2;
  }
};
const groupByPublicationCode = (issues) =>
  issues?.reduce(
    (acc, { publicationcode, issuenumber }) => ({
      ...acc,
      [publicationcode]: [
        ...new Set([
          ...(acc[publicationcode] || []),
          issuenumber.replace(" ", ""),
        ]),
      ],
    }),
    {}
  );
const importIssues = async () => {
  const importableIssuesByPublicationCode =
    groupByPublicationCode(issuesImportable);
  for (const publicationCode in importableIssuesByPublicationCode) {
    if (importableIssuesByPublicationCode.hasOwnProperty(publicationCode)) {
      await axios.post("/collection/issues", {
        publicationCode,
        issueNumbers: importableIssuesByPublicationCode[publicationCode],
        condition: issueDefaultCondition,
        isOnSale: "do_not_change",
        purchaseId: "do_not_change",
      });
      importProgress +=
        100 / Object.keys(importableIssuesByPublicationCode).length;
    }
  }

  await router.push("/collection/show");
};

watch(
  () => importDataReady,
  (newValue) => {
    if (newValue) {
      issuesNotReferenced = [];
      issuesAlreadyInCollection = [];
      issuesImportable = [];
      issuesToImport.forEach((issue) => {
        const { publicationcode, issuenumber } = issue;
        if (
          !issueNumbers[publicationcode].includes(
            issuenumber.replace(/[ ]+/g, " ")
          )
        )
          issuesNotReferenced.push(issue);
        else if (
          collectionStore().findInCollection(publicationcode, issuenumber)
        )
          issuesAlreadyInCollection.push(issue);
        else issuesImportable.push(issue);
      });
      issuesNotReferenced = [...new Set(issuesNotReferenced)];
      issuesAlreadyInCollection = [...new Set(issuesAlreadyInCollection)];
      issuesImportable = [...new Set(issuesImportable)];
    }
  }
);
watch(
  () => issuesToImport,
  async (newValue) => {
    const publicationCodes = newValue.reduce(
      (acc, { publicationcode }) => [...acc, publicationcode],
      []
    );
    await fetchPublicationNames(publicationCodes);
    hasPublicationNames = true;
    await fetchIssueNumbers(publicationCodes);
    hasIssueNumbers = true;
  }
);

onMounted(async () => {
  await collectionStore().loadCollection();
});
</script>

<style scoped lang="scss">
#wrapper {
  background: white !important;
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

iframe,
textarea {
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
