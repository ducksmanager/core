<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div v-if="!user" id="wrapper" class="container-fluid py-5">
    <p class="col-md-8 fs-4" />
    <div id="dm-loves-inducks">
      <div
        id="dm-logo-small"
        :style="{ backgroundImage: `url(${getImagePath('logo_small.png')})` }"
      >
        &nbsp;
      </div>
      <div
        id="loves"
        :style="{ backgroundImage: `url(${getImagePath('icons/heart.png')})` }"
      >
        &nbsp;
      </div>
      <div
        id="inducks-logo"
        :style="{ backgroundImage: `url(${getImagePath('inducks_logo.png')})` }"
      >
        &nbsp;
      </div>
    </div>
    <p>
      {{
        $t(
          "DucksManager utilise la base de données Inducks pour lister les numéros référencés pour chacun des magazines Disney.",
        )
      }}
    </p>
    <p>
      <span
        v-html="
          $t(
            `Si vous possédez déjà une collection Inducks, vous pouvez <b>l'importer sur DucksManager en quelques clics.</b>`,
          )
        "
      /><br />
      {{
        $t(
          'Pour cela, créez une nouvelle collection DucksManager ou connectez-vous à votre collection DucksManager existante, puis sélectionnez "{0}" dans le menu.',
          [$t("Collection Inducks")],
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
  <form v-else-if="step === 1" id="inducks-import">
    <b-alert :model-value="true" variant="info">
      <div>
        {{
          $t(
            "Cette page vous permet d'importer votre collection Inducks dans DucksManager.",
          )
        }}
      </div>
      {{ $t("Pour cela, suivez les étapes suivantes :") }}
      <ol>
        <li>
          {{
            $t(
              "Sur l'écran de gauche, connectez-vous, si ce n'est déjà fait, sur Inducks.",
            )
          }}
        </li>
        <i18n-t
          tag="li"
          keypath="Une fois connecté(e), vous parviendrez sur une page contenant votre collection sous forme d'une liste commençant par : {inducks_header}"
        >
          <template #inducks_header>
            <pre>country^entrycode^collectiontype^comment</pre>
          </template></i18n-t
        >

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
    <b-alert v-if="issuesImportable" :model-value="true" variant="info">
      <div>
        {{ issuesImportable.length }}
        {{ $t("numéros peuvent être importés.") }}
      </div>
      <div v-if="hasPublicationNames" role="tablist">
        <Accordion
          v-for="[publicationcode, publicationIssues] in Object.entries(
            groupByPublicationCode(issuesImportable),
          )"
          :id="String(publicationcode).replace('/', '-')"
          :key="String(publicationcode).replace('/', '-')"
          :visible="expandedPublicationAccordion === publicationcode"
          accordion-group-id="import-accordion"
          @bv::toggle::collapse="expandedPublicationAccordion = publicationcode"
        >
          <template #header>
            <Publication
              :publicationcode="publicationcode"
              :publicationname="
                publicationNames[publicationcode] || publicationcode
              "
            />
            x {{ publicationIssues.length }}
          </template>
          <template #content>
            <div v-for="{ issuecode } in publicationIssues" :key="issuecode">
              {{ $t("Numéro") }} {{ issuecodeDetails[issuecode].issuenumber }}
            </div>
          </template>
        </Accordion>
        <b-collapse visible />
      </div>
    </b-alert>
    <b-alert
      v-if="issuesNotReferenced?.length || issuesAlreadyInCollection?.length"
      :model-value="true"
      variant="warning"
    >
      <template v-if="issuesAlreadyInCollection?.length">
        <div>
          {{ issuesAlreadyInCollection.length }}
          {{
            $t(
              "numéros ne peuvent pas être importés car vous les possédez déjà dans votre collection.",
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
                publicationIssuecodes, publicationcode
              ) in groupByPublicationCode(issuesAlreadyInCollection)"
              :key="publicationcode"
            >
              <div
                v-for="{ issuecode } in publicationIssuecodes"
                :key="issuecode"
              >
                <Issue :issuecode="issuecode" />
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
              "numéros ne peuvent pas être importés car ils n'existent plus sur Inducks.",
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
                publicationIssuecodes, publicationcode
              ) in groupByPublicationCode(issuesNotReferenced)"
              :key="publicationcode"
            >
              <Issue
                v-for="{ issuecode } in publicationIssuecodes"
                :key="issuecode"
                :issuecode="issuecode"
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
          v-model="issueDefaultCondition as string"
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
          :label="`${importProgress.toFixed(0)}%`"
        />
      </b-progress>
      <b-button v-else @click="importIssues">
        {{ $t("Importer") }} {{ issuesImportable.length }}
        {{ $t("numéro | numéros", issuesImportable.length) }}
      </b-button>
    </template>
  </template>
</template>

<script setup lang="ts">
import type { issue_condition } from "~prisma-schemas/schemas/dm";

import { socketInjectionKey } from "../composables/useDmSocket";

const { getImagePath } = images();

let step = $ref(1);
const rawData = $ref("");
const expandedPublicationAccordion = $ref<string>();
const expandedNotImportableAccordion = $ref<string>();
let hasPublicationNames = $ref(false);
let hasIssuecodes = $ref(false);
const issueDefaultCondition = $ref<issue_condition>("bon");
let issuesToImport = $shallowRef<string[]>();
let issuesNotReferenced = $shallowRef<string[]>();
let issuesAlreadyInCollection = $shallowRef<string[]>();
let issuesImportable = $shallowRef<string[]>();
let importProgress = $ref(0);

const { collection: collectionEvents } = inject(socketInjectionKey)!;

const { t: $t } = useI18n();

const { findInCollection, loadCollection } = collection();
const { issues, user } = storeToRefs(collection());

const {
  fetchPublicationNames,
  fetchIssuecodesByPublicationcode,
  fetchIssuecodeDetails,
} = coa();
const { publicationNames, issuecodes, issuecodeDetails } = storeToRefs(coa());
const conditions: Record<issue_condition, string> = {
  mauvais: $t("En mauvais état"),
  moyen: $t("En état moyen"),
  bon: $t("En bon état"),
  indefini: $t("En état indéfini"),
};
const importDataReady = $computed(
  () => issuesToImport && issues.value && hasIssuecodes,
);
const router = useRouter();
const processRawData = async () => {
  const REGEX_VALID_ROW = /^([^^]+\^[^^]+)\^/;
  const issueCodes = rawData
    .split("\n")
    .filter((row: string) => !/^country/.test(row) && REGEX_VALID_ROW.test(row))
    .map((row: string) => row.match(REGEX_VALID_ROW)![1].replace("^", "/"));
  await fetchIssuecodeDetails(issueCodes);

  if (!issuecodeDetails) {
    return;
  }
  const issues = issueCodes.filter(
    (issueCode) => issuecodeDetails.value[issueCode],
  );
  if (issues.length) {
    issuesToImport = issues;
    step = 2;
  }
};

const groupByPublicationCode = (issues: string[]) =>
  issues
    ?.map((issuecode) => ({
      issuecode,
      publicationcode: issuecodeDetails.value[issuecode].publicationcode,
    }))
    .groupBy("publicationcode", "[]");

const importIssues = async () => {
  const importableIssuesByPublicationCode = groupByPublicationCode(
    issuesImportable!,
  );
  for (const publicationcode in importableIssuesByPublicationCode) {
    if (importableIssuesByPublicationCode.hasOwnProperty(publicationcode)) {
      await collectionEvents.addOrChangeIssues({
        issuecodes: importableIssuesByPublicationCode[publicationcode].map(
          ({ issuecode }) => issuecode,
        ),
        condition: issueDefaultCondition,
        isOnSale: undefined,
        isToRead: undefined,
        purchaseId: undefined,
      });
      importProgress +=
        100 / Object.keys(importableIssuesByPublicationCode).length;
    }
  }

  router.push("/collection/show");
};

watch($$(importDataReady), (newValue) => {
  if (newValue) {
    issuesNotReferenced = [];
    issuesAlreadyInCollection = [];
    issuesImportable = [];
    issuesToImport!.forEach((issuecode) => {
      if (!issuecodes.value.includes(issuecode.replace(/[ ]+/g, " ")))
        issuesNotReferenced!.push(issuecode);
      else if (findInCollection(issuecode))
        issuesAlreadyInCollection!.push(issuecode);
      else issuesImportable!.push(issuecode);
    });
    issuesNotReferenced = [...new Set(issuesNotReferenced)];
    issuesAlreadyInCollection = [...new Set(issuesAlreadyInCollection)];
    issuesImportable = [...new Set(issuesImportable)];
  }
});
watch($$(issuesToImport), async (newValue) => {
  if (!newValue) {
    return;
  }
  const publicationCodes = newValue.map(
    (issuecode) => issuecodeDetails.value[issuecode].publicationcode,
  );
  await fetchPublicationNames(publicationCodes);
  hasPublicationNames = true;
  await fetchIssuecodesByPublicationcode(publicationCodes);
  hasIssuecodes = true;
});

loadCollection();
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
