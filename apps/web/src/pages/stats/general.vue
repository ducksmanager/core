<template>
  <div>
    <LinkToCollectionIfNoIssue />
    <ShortStats v-if="userCount !== null">
      <template #non-empty-collection>
        <div>
          <i18n-t
            tag="span"
            keypath="Le contenu de votre collection est {rank} en terme de rareté sur DucksManager."
            ><template #rank>
              <b>{{ $t("n°{0} / {1}", [rarityValue, userCount]) }}</b>
            </template></i18n-t
          >
          <br />
          <b-alert
            variant="info"
            :model-value="true"
            size="sm"
            class="d-inline-block mt-3"
          >
            <small>
              {{
                $t(
                  "La rareté de votre collection est calculée sur la base du nombre d'autres utilisateurs qui possèdent chacun des magazines de votre collection."
                )
              }}</small
            >
          </b-alert>
        </div>
      </template>
    </ShortStats>
    <div v-else>
      {{ $t("Chargement...") }}
    </div>
    <h2>{{ $t("Valeur de la collection") }}</h2>
    <template v-if="quotedIssues !== null && hasPublicationNames">
      <b-alert v-if="quotationSum === 0" :model-value="true" variant="info">
        <small>{{
          $t("Votre collection ne contient pas de magazines cotés.")
        }}</small>
      </b-alert>
      <div v-else>
        <div
          class="my-3"
          v-html="
            $t('La valeur de votre collection est estimée à : {0}.', [
              $t('Plus de {0} {1}', [quotationSum, '€']),
            ])
          "
        />
        <Accordion
          id="quotation-details"
          accordion-group-id="quotation-details"
          :visible="false"
        >
          <template #header>
            {{ $t("Détails") }}
          </template>
          <template #content>
            <div class="my-3">
              {{
                $t("Votre collection contient {0} magazines cotés.", [
                  quotedIssues!.length,
                ])
              }}
            </div>
            <b-table
              striped
              :items="quotedIssues"
              :per-page="50"
              :current-page="currentPage"
              :fields="quotationFields"
            >
              <template #cell(issue)="{ item }">
                <Issue
                  :publicationcode="(item as QuotedIssue).publicationcode"
                  :publicationname="publicationNames[(item as QuotedIssue).publicationcode ]!"
                  :issuenumber="(item as QuotedIssue).issuenumber"
                />
              </template>
              <template #cell(condition)="{ item }">
                {{ getConditionLabel((item as QuotedIssue).condition) }}
              </template>
              <template #cell(estimation)="{ item }">
                {{ item.estimation }}€
              </template>
              <template #cell(estimationGivenCondition)="{ item }">
                {{ item.estimationGivenCondition }}€
              </template>
            </b-table>
            <b-pagination
              v-model="currentPage"
              :total-rows="quotedIssues!.length"
              :per-page="50"
            />
          </template>
        </Accordion>
      </div>
      <Accordion
        id="quotation-explanation"
        accordion-group-id="quotation-explanation"
      >
        <template #header>
          {{
            $t("Comment DucksManager calcule-t-il la valeur de ma collection ?")
          }}
        </template>
        <template #content>
          <div>
            {{
              $t(
                "Si certains des magazines de votre collection sont cotés, DucksManager peut en calculer la valeur approximative."
              )
            }}
          </div>
          <div
            v-html="
              $t(
                'Les cotes utilisées proviennent des sites Internet {0}, {1}, {2} et {3}.',
                [
                  `<a href='https://bedetheque.com'>Bédéthèque</a>`,
                  `<a href='http://comicsmania.gr'>ComicsMania</a>`,
                  `<a href='https://seriesam.com'>Seriesam</a>`,
                  `<a href='https://gocollect.com'>Gocollect</a>`,
                ]
              )
            "
          />
          {{
            $t(
              "Ces cotes sont ensuite ajustées en fonction des états que vous spécifiez pour chacun des numéros, selon le barème suivant :"
            )
          }}
          <ul>
            <li>{{ $t("Numéro en bon état : pas d'ajustement") }}</li>
            <li>{{ $t("Numéro en moyen état : 70% de la cote") }}</li>
            <li>{{ $t("Numéro en mauvais état : 30% de la cote") }}</li>
            <li>{{ $t("Etat non défini : 70% de la cote") }}</li>
          </ul>
          <div
            v-html="
              $t(
                `Une cote présente sur les sites indiqués ci-dessus n'est pas incluse dans la valeur de votre collection calculée par DucksManager ? Faites-le nous savoir en envoyant un e-mail à {0} :-)`,
                [
                  `<a href='mailto:admin@ducksmanager.net'>admin@ducksmanager.net</a>`,
                ]
              )
            "
          />
        </template>
      </Accordion>
    </template>
    <div v-else>
      {{ $t("Chargement...") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import condition from "~/composables/useCondition";
import { coa } from "~/stores/coa";
import {
  collection as collectionStore,
  QuotedIssue,
} from "~/stores/collection";
import { users } from "~/stores/users";
import { GET__global_stats__user__collection__rarity } from "~api-routes";
import { call } from "~axios-helper";

const collection = collectionStore();
const { getConditionLabel } = condition();

const { t: $t } = useI18n();
let currentPage = $ref(1);
const userCount = $computed(() => users().count);
const publicationNames = $computed(() => coa().publicationNames);
const quotedIssues = $computed(() =>
  collection.quotedIssues?.sort(
    (
      { estimationGivenCondition: estimation1 },
      { estimationGivenCondition: estimation2 }
    ) => Math.sign(estimation2 - estimation1)
  )
);
const quotationSum = $computed(() => collection.quotationSum);
const quotationFields = [
  { key: "issue", label: $t("Numéro") },
  { key: "condition", label: $t("Etat") },
  { key: "estimation", label: $t("Estimation") },
  {
    key: "estimationGivenCondition",
    label: $t("Estimation ajustée de l'état"),
  },
];

let rarityValue = $ref(null as number | null);
let hasPublicationNames = $ref(false as boolean);

watch(
  () => collection.totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await coa().fetchIssueQuotations(Object.keys(newValue));
    }
  },
  { immediate: true }
);

watch(
  () => quotedIssues,
  async (newValue) => {
    if (newValue) {
      await coa().fetchPublicationNames(
        newValue.map(({ publicationcode }) => publicationcode)
      );
      hasPublicationNames = true;
    }
  },
  { immediate: true }
);

(async () => {
  await collection.loadCollection();
  await users().fetchCount();
  const { userScores } = (
    await call(axios, new GET__global_stats__user__collection__rarity())
  ).data;
  rarityValue =
    userScores.length -
    userScores.findIndex(({ userId }) => userId === collection.user?.id);
})();
</script>

<style scoped lang="scss">
:deep(div) {
  font-size: 16px;
}

:deep(#short-stats > div) {
  margin-bottom: 32px;
}

.card {
  color: black;

  :deep(td),
  :deep(div) {
    line-height: 30px;
  }
}
</style>
