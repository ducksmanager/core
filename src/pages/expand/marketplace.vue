<route lang="yaml">
alias: [/agrandir/marketplace]
</route>

<template>
  <b-alert show variant="info"
    >{{
      $t(
        "Cette page indique les numéros que d'autres utilisateurs sur DucksManager proposent à la vente et que vous surveillez. Cliquez sur le ou les numéros qui vous intéressent,"
      )
    }}
    <span v-if="isTouchScreen">{{
      $t("puis faites un appui long pour contacter le vendeur.")
    }}</span>
    <span v-else>{{
      $t("puis faites un clic droit pour contacter le vendeur.")
    }}</span>
    <div>
      {{ $t("Les messages sont envoyés aux vendeurs une fois par jour.") }}
    </div>
  </b-alert>
  <b-alert
    v-if="hasPublicationNames && pendingRequestIssueIds.length"
    show
    variant="info"
  >
    <div>Les e-mails suivants seront envoyés demain à 8h00:</div>
    <Accordion
      v-for="(issueIds, userId) in pendingRequestIssueIdsBySellerId"
      :id="`email-for-user-${userId}`"
      :key="`email-for-user-${userId}`"
      :accordion-group-id="`email-for-user-${userId}`"
    >
      <template #header
        >{{ $t("E-mail à") }} {{ stats[userId].username }}</template
      >
      <template #content
        ><div>{{ $t("Bonjour ") }}{{ stats[userId].username }},</div>
        {{
          $t(
            "Je suis intéressé par les numéros suivants que vous avez mis en vente :"
          )
        }}:
        <ul>
          <li v-for="issueId of issueIds" :key="issueId">
            <Issue
              :publicationcode="issuesOnSaleById[issueId].publicationcode"
              :issuenumber="issuesOnSaleById[issueId].issueNumber"
              :publicationname="
                publicationNames[issuesOnSaleById[issueId].publicationcode]
              "
            />
          </li>
        </ul>
        {{ $t("Pourriez-vous me proposer un prix ?") }}</template
      >
    </Accordion>
  </b-alert>
  <div v-if="issuesOnSaleByOthers && issueRequests && hasPublicationNames">
    <b-alert
      v-if="!Object.keys(issuesOnSaleByOthers).length"
      show
      variant="info"
    >
      {{
        $t(
          "Aucun numéro que vous ne possédez pas n'est en vente parmi les magazines que vous avez surveillés. Cliquez sur "
        )
      }}<Watch class="ml-2" publicationcode="" />{{
        $t(
          " à côté d'un magazine ou d'un numéro dans la page de gestion de la collection pour voir les numéros en vente."
        )
      }}
    </b-alert>
    <span v-else>
      {{ $t("Montrer les magazines en vente par") }}
      <BFormSelect v-model="userIdFilter" size="sm">
        <b-form-select-option :key="null" :value="null">
          {{ $t("Tous les utilisateurs") }}
        </b-form-select-option>
        <b-form-select-option
          v-for="{ text, value } in sellingUserNames"
          :key="value"
          :value="value"
        >
          {{ text }}
        </b-form-select-option>
      </BFormSelect>
    </span>
    <IssueList
      v-for="(issues, publicationcode) in issuesOnSaleByOthers"
      :key="publicationcode"
      :publicationcode="publicationcode"
      :custom-issues="
        userIdFilter
          ? issues.filter(({ userId }) => userId === userIdFilter)
          : issues
      "
      on-sale-by-others
      :group-user-copies="false"
      context-menu-component-name="context-menu-on-sale-by-others"
      ><template #onSaleByOther="{ userId, id }">
        <span
          class="d-inline-block me-2"
          :class="{
            'issue-request':
              pendingRequestIssueIds.includes(id) ||
              sentRequestIssueIds.includes(id),
          }"
          ><template v-if="pendingRequestIssueIds.includes(id)">{{
            $t("E-mail bientôt envoyé à")
          }}</template
          ><template v-else-if="sentRequestIssueIds.includes(id)">{{
            $t("E-mail envoyé à")
          }}</template
          ><template v-else>{{ $t("En vente par") }}</template
          >&nbsp;<UserPopover
            :points="points[userId]"
            :stats="stats[userId]" /></span></template
    ></IssueList>
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup>
import Accordion from "~/components/Accordion.vue";
import { coa } from "~/stores/coa";
import { marketplace } from "~/stores/marketplace";
import { users } from "~/stores/users";

const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

const issuesOnSaleByOthers = $computed(
  () => marketplace().issuesOnSaleByOthers
);
const pendingRequestIssueIds = $computed(
  () => marketplace().pendingRequestIssueIds
);
const pendingRequestIssueIdsBySellerId = $computed(
  () => marketplace().pendingRequestIssueIdsBySellerId
);
const issuesOnSaleById = $computed(() => marketplace().issuesOnSaleById);
const sentRequestIssueIds = $computed(() => marketplace().sentRequestIssueIds);
const issueRequests = $computed(() => marketplace().issueRequests);

const publicationNames = $computed(() => coa().publicationNames);

const stats = $computed(() => users().stats);
const points = $computed(() => users().points);

let hasPublicationNames = $ref(false);
let userIdFilter = $ref(null);
let sellingUserNames = $ref([]);

onMounted(async () => {
  await marketplace().loadIssuesOnSaleByOthers();
  await marketplace().loadIssueRequests();

  const sellingUserIds = [
    ...new Set(
      Object.values(issuesOnSaleByOthers).reduce(
        (acc, issues) => [...acc, ...issues.map((issue) => issue.userId)],
        []
      )
    ),
  ];
  await users().fetchStats(sellingUserIds);
  sellingUserNames = sellingUserIds
    .reduce(
      (acc, userId) => [
        ...acc,
        { value: userId, text: stats[userId].username },
      ],
      []
    )
    .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2));
  await coa().fetchPublicationNames(Object.keys(issuesOnSaleByOthers));
  hasPublicationNames = true;
});
</script>

<style scoped lang="scss">
.issue-request {
  color: cyan;
}
</style>
