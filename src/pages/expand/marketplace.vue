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
  </b-alert>
  <b-alert
    v-if="hasPublicationNames && sentRequestIssueIds.length"
    show
    variant="info"
  >
    <div>{{ $t("Demandes envoyées :") }}</div>
    <Accordion
      v-for="(issueIds, userId) in requestIssueIdsBySellerId"
      :id="`email-for-user-${userId}`"
      :key="`email-for-user-${userId}`"
      :accordion-group-id="`email-for-user-${userId}`"
    >
      <template #header
        >{{ $t("Demande à") }} {{ stats[userId].username }}
        <b-button
          variant="warning"
          pill
          class="small d-inline-flex align-items-center"
          style="height: 20px"
          @click.exact="deleteRequestsToSeller(userId)"
          >{{ $t("Annuler la demande") }}</b-button
        >
      </template>
      <template #content>
        <ul>
          <li v-for="issueId of issueIds" :key="issueId">
            <Issue
              :publicationcode="issuesOnSaleById[issueId].publicationcode"
              :issuenumber="issuesOnSaleById[issueId].issueNumber"
              :publicationname="
                publicationNames[issuesOnSaleById[issueId].publicationcode]
              "
            />
          </li></ul
      ></template>
    </Accordion>
  </b-alert>
  <div
    v-if="issuesOnSaleByOthers && issueRequestsAsBuyer && hasPublicationNames"
  >
    <b-alert
      v-if="!Object.keys(issuesOnSaleByOthers).length"
      show
      variant="info"
    >
      {{
        $t(
          "Aucun numéro que vous ne possédez pas n'est en vente parmi les magazines que vous avez surveillés. Cliquez sur"
        )
      }}<Watch />{{
        $t(
          "à côté d'un magazine ou d'un numéro dans la page de gestion de la collection pour voir les numéros en vente sur cette page."
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
          v-for="{ text, value } in sellerUserNames"
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
    />
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
const sentRequestIssueIds = $computed(() => marketplace().sentRequestIssueIds);
const requestIssueIdsBySellerId = $computed(
  () => marketplace().requestIssueIdsBySellerId
);
const issuesOnSaleById = $computed(() => marketplace().issuesOnSaleById);
const issueRequestsAsBuyer = $computed(
  () => marketplace().issueRequestsAsBuyer
);
const sellerUserNames = $computed(() => marketplace().sellerUserNames);

const publicationNames = $computed(() => coa().publicationNames);

const stats = $computed(() => users().stats);

let hasPublicationNames = $ref(false);
let userIdFilter = $ref(null);

const deleteRequestsToSeller = async (sellerId) => {
  await marketplace().deleteRequestsToSeller(parseInt(sellerId));
  await marketplace().loadIssueRequestsAsBuyer(true);
};
onMounted(async () => {
  await marketplace().loadIssuesOnSaleByOthers();
  await marketplace().loadIssueRequestsAsBuyer();

  await users().fetchStats(marketplace().sellerUserIds);
  await coa().fetchPublicationNames(Object.keys(issuesOnSaleByOthers));
  hasPublicationNames = true;
});
</script>
