<route lang="yaml">
alias:
  - /stats
</route>
<template>
  <div>
    <LinkToCollectionIfNoIssue />
    <ShortStats v-if="userCount !== null">
      <template #non-empty-collection>
        <div v-if="rarityRank" id="rarity-stats">
          <i18n-t
            tag="span"
            keypath="Le contenu de votre collection est {rank} en terme de rareté sur DucksManager."
            ><template #rank>
              <b>{{ $t("n°{0} / {1}", [rarityRank, userCount]) }}</b>
            </template></i18n-t
          ><template v-if="userIdAboveMe"
            >&nbsp;<UserPopover
              v-if="stats[userIdAboveMe]"
              :stats="stats[userIdAboveMe]"
              :points="points[userIdAboveMe]"
            />
            {{ $t("est n°{0}", [rarityRank - 1]) }}
          </template>
          <br />
          <b-alert
            variant="info"
            :model-value="true"
            size="sm"
            class="d-inline-block mt-3"
          >
            <div>
              {{
                $t(
                  "La rareté de votre collection est calculée sur la base du nombre d'autres utilisateurs qui possèdent chacun des magazines de votre collection.",
                )
              }}
            </div>
            <div v-if="rarestIssue" class="mt-2 d-inline-flex">
              <div class="me-2 pb-2">
                {{ $t("Votre numéro le plus rare est") }}
              </div>
              <Issue
                flex
                v-bind="{...rarestIssue, publicationname: publicationNames[rarestIssue.publicationcode!]!}"
              />
            </div>
          </b-alert>
        </div>
        <div v-else>
          {{ $t("Calcul de la rareté...") }}
        </div>
      </template>
    </ShortStats>
    <div v-else>
      {{ $t("Chargement...") }}
    </div>
    <h2>{{ $t("Valeur de la collection") }}</h2>
    <template v-if="quotedIssuesForCollection !== null && hasPublicationNames">
      <b-alert v-if="quotationSum === 0" :model-value="true" variant="info">
        <small>{{
          $t("Votre collection ne contient pas de magazines cotés.")
        }}</small>
      </b-alert>
      <div v-else id="quotation-stats">
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
                  quotedIssuesForCollection!.length,
                ])
              }}
            </div>
            <b-table
              striped
              :items="quotedIssuesForCollection"
              :per-page="50"
              :current-page="currentPage"
              :fields="quotationFields"
            >
              <template #cell(issue)="{ item }">
                <Issue
                  v-bind="{...issuecodeDetails[item.issuecode!], publicationname: publicationNames[issuecodeDetails[item.issuecode!].publicationcode!]!}"
                />
              </template>
              <template #cell(condition)="{ item }">
                {{ getConditionLabel(item.condition) }}
              </template>
              <template #cell(estimation)="{ item }">
                <IssueQuotation :issue="item" />
              </template>
              <template #cell(estimationGivenCondition)="{ item }">
                {{ item.estimationGivenCondition }}€
              </template>
            </b-table>
            <b-pagination
              v-model="currentPage"
              :total-rows="quotedIssuesForCollection!.length"
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
            <li>{{ $t("Numéro en état moyen : 70% de la cote") }}</li>
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

<script setup lang="ts">
import { AugmentedIssue } from "~dm-types/AugmentedIssue";
import { socketInjectionKey } from "../../composables/useDmSocket";

const { userGlobalStats: userGlobalStatsEvents } = inject(socketInjectionKey)!;

const { getConditionLabel } = useCondition();

const { t: $t } = useI18n();
let currentPage = $ref(1);

const { fetchCount, fetchStats } = users();
const { count: userCount, stats, points } = storeToRefs(users());

const { loadCollection, loadUserIssueQuotations } = collection();
const { totalPerPublication, quotedIssues, quotationSum } =
  storeToRefs(collection());

const { fetchPublicationNames, fetchIssuecodeDetails } = coa();
const { issuecodeDetails, publicationNames } = storeToRefs(coa());

const quotedIssuesForCollection = $computed(() =>
  quotedIssues.value?.sort(
    (
      { estimationGivenCondition: estimation1 },
      { estimationGivenCondition: estimation2 },
    ) => Math.sign(estimation2 - estimation1),
  ),
);
const quotationFields = [
  { key: "issue", label: $t("Numéro") },
  { key: "condition", label: $t("Etat") },
  { key: "estimation", label: $t("Estimation") },
  {
    key: "estimationGivenCondition",
    label: $t("Estimation ajustée de l'état"),
  },
];

let rarestIssue = $ref<null | AugmentedIssue<
  ["publicationcode", "issuenumber"]
>>(null);
let rarityRank = $ref<null | number>(null);
let userIdAboveMe = $ref<null | number>(null);
let hasPublicationNames = $ref(false as boolean);

watch(
  totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await loadUserIssueQuotations();
    }
  },
  { immediate: true },
);

watch(
  quotedIssues,
  async (newValue) => {
    if (newValue) {
      fetchIssuecodeDetails(newValue.map(({ issuecode }) => issuecode!));
      await fetchPublicationNames(
        newValue.map(
          ({ issuecode }) => issuecodeDetails.value[issuecode!].publicationcode,
        ),
      );
      hasPublicationNames = true;
    }
  },
  { immediate: true },
);

(async () => {
  await loadCollection();
  await fetchCount();
  const rarityData = await userGlobalStatsEvents.getUsersCollectionRarity();
  rarityRank = rarityData.me.rank;
  userIdAboveMe = rarityData.aboveMe.userId;

  const rarestIssuecode = rarityData.me.rarestIssue.issuecode;
  await fetchIssuecodeDetails([rarestIssuecode]);
  await fetchPublicationNames([
    issuecodeDetails.value[rarestIssuecode].publicationcode!,
  ]);
  rarestIssue = {
    ...issuecodeDetails.value[rarestIssuecode],
    publicationcode: issuecodeDetails.value[rarestIssuecode].publicationcode!,
    issuenumber: issuecodeDetails.value[rarestIssuecode].issuenumber!,
  };
  if (rarityData.aboveMe.userId) {
    await fetchStats([rarityData.aboveMe.userId]);
  }
})();
</script>

<style scoped lang="scss">
#quotation-stats {
  :deep(div) {
    font-size: 12px;
  }
}

:deep(#short-stats) {
  font-size: 12px;
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
