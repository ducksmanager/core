<template>
  <div>
    <ShortStats v-if="userCount !== null" id="short-stats">
      <template #non-empty-collection>
        <div>
          <span
            v-html="
              $t(
                'Le contenu de votre collection est <b>n°{0} / {1}</b> en terme de rareté sur DucksManager.',
                [rarityValue, userCount],
              )
            "
          /><br>
          <BAlert variant="info" show size="sm" class="d-inline-block mt-3">
            <small>
              {{
                $t(
                  "La rareté de votre collection est calculée sur la base du nombre d'autres utilisateurs qui possèdent chacun des magazines de votre collection.",
                )
              }}</small>
          </BAlert>
        </div>
      </template>
    </ShortStats>
    <div v-else>
      {{ $t("Chargement...") }}
    </div>
    <h2>{{ $t("Valeur de la collection") }}</h2>
    <template v-if="quotedIssues !== null && hasPublicationNames">
      <BAlert v-if="quotationSum === 0" show variant="info">
        <small>{{
          $t("Votre collection ne contient pas de magazines cotés.")
        }}</small>
      </BAlert>
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
                  quotedIssues.length,
                ])
              }}
            </div>
            <BTable
              striped
              :items="quotedIssues"
              :per-page="50"
              :current-page="currentPage"
              :fields="quotationFields"
            >
              <template #cell(issue)="{ item }">
                <Issue
                  :publicationcode="item.publicationCode"
                  :publicationname="publicationNames[item.publicationCode]"
                  :issuenumber="item.issueNumber"
                />
              </template>
              <template #cell(condition)="{ item }">
                {{ getConditionLabel(item.condition) }}
              </template>
              <template #cell(estimation)="{ item }">
                {{ item.estimation }}€
              </template>
              <template #cell(estimationGivenCondition)="{ item }">
                {{ item.estimationGivenCondition }}€
              </template>
            </BTable>
            <BPagination
              v-model="currentPage"
              :total-rows="quotedIssues.length"
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
                "Si certains des magazines de votre collection sont cotés, DucksManager peut en calculer la valeur approximative.",
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
                ],
              )
            "
          />
          {{
            $t(
              "Ces cotes sont ensuite ajustées en fonction des états que vous spécifiez pour chacun des numéros, selon le barème suivant :",
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
                ],
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

<script setup>
import axios from 'axios'
import { BAlert, BPagination, BTable } from 'bootstrap-vue-3'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { coa } from '~/stores/coa'
import { collection as collectionStore } from '~/stores/collection'
import { users } from '~/stores/users'
import { condition } from '~/composables/condition'
import Cookies from "js-cookie";

const collection = collectionStore()
const { getConditionLabel } = condition()

const { t: $t } = useI18n()
const currentPage = 1
const userCount = $computed(() => users().count)
const publicationNames = $computed(() => coa().publicationNames)
const quotedIssues = $computed(() =>
  collection.quotedIssues?.sort(
    (
      { estimationGivenCondition: estimation1 },
      { estimationGivenCondition: estimation2 },
    ) => Math.sign(estimation2 - estimation1),
  ),
)
const quotationSum = $computed(() => collection.quotationSum)
const quotationFields = [
  { key: 'issue', label: $t('Numéro') },
  { key: 'condition', label: $t('Etat') },
  { key: 'estimation', label: $t('Estimation') },
  {
    key: 'estimationGivenCondition',
    label: $t('Estimation ajustée de l\'état'),
  },
]

let rarityValue = $ref(null)
let hasPublicationNames = $ref(false)

watch(
  () => collection.totalPerPublication,
  async (newValue) => {
    await coa().fetchIssueQuotations(Object.keys(newValue))
  },
)

watch(
  () => quotedIssues,
  async (newValue) => {
    if (newValue) {
      await coa().fetchPublicationNames(
        newValue.map(({ publicationCode }) => publicationCode),
      )
      hasPublicationNames = true
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await collection.loadCollection();
  await users().fetchCount()
  const { userScores } = (
    await axios.get('/global-stats/user/collection/rarity', {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    })
  ).data
  rarityValue = userScores.length - userScores.findIndex(({ userId }) => userId === collection.user.id)
})
</script>

<style scoped lang="scss">
:deep(div) {
  font-size: 16px;
}

#short-stats :deep(> div) {
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
