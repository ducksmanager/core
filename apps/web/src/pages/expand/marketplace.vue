<route lang="yaml">
alias: [/agrandir/marketplace]
</route>

<template>
  <b-alert :model-value="true" variant="info"
    >{{
      $t(
        "Cette page indique les numéros que d'autres utilisateurs sur DucksManager proposent à la vente et que vous surveillez. Cliquez sur le ou les numéros qui vous intéressent,",
      )
    }}
    <b v-if="isTouchScreen">{{
      $t(
        "puis tapotez deux fois au niveau de la liste pour contacter le vendeur.",
      )
    }}</b>
    <b v-else>{{
      $t("puis faites un clic droit pour contacter le vendeur.")
    }}</b>
  </b-alert>
  <b-alert
    v-if="
      hasPublicationNames &&
      sentRequestIssueIds?.length &&
      Object.keys(requestIssueIdsBySellerId).length
    "
    :model-value="true"
    variant="info"
  >
    <div>{{ $t("Demandes envoyées :") }}</div>
    <accordion
      v-for="(issueIds, userId) in requestIssueIdsBySellerId"
      :id="`email-for-user-${String(userId)}`"
      :key="`email-for-user-${String(userId)}`"
      visible
      :accordion-group-id="`email-for-user-${String(userId)}`"
    >
      <template #header
        >{{ $t("Demandes à") }} {{ stats[Number(userId)].username }}
      </template>
      <template #content>
        <ul>
          <li v-for="issueId of issueIds" :key="issueId">
            <Issue
              hide-condition
              :issuecode="issuesOnSaleById[issueId].issuecode"
            />
            <b-badge
              v-if="isRequestBooked(issueId)"
              variant="info"
              class="small d-inline-flex align-items-center"
              style="height: 14px"
              >{{ $t("Réservé !") }}</b-badge
            >
            <b-button
              variant="outline-warning"
              pill
              class="small d-inline-flex align-items-center ms-2"
              style="height: 14px"
              @click.exact="
                deleteRequestToSeller(issueId);
                loadIssueRequestsAsBuyer(true);
              "
              >{{ $t("Annuler la demande") }}</b-button
            >
          </li>
        </ul></template
      >
    </accordion>
  </b-alert>
  <div
    v-if="issuesOnSaleByOthers && issueRequestsAsBuyer && hasPublicationNames"
  >
    <b-alert
      v-if="!Object.keys(issuesOnSaleByOthers).length"
      :model-value="true"
      variant="info"
    >
      {{
        $t(
          "Aucun numéro que vous ne possédez pas n'est en vente parmi les magazines que vous avez surveillés. Cliquez sur",
        )
      }}<Watch /><i18n-t
        tag="span"
        keypath="à côté d'un magazine ou d'un numéro dans {manage_link} pour voir les numéros en vente sur cette page."
        ><template #manage_link
          ><router-link to="/collection/show">{{
            $t("la page de gestion de la collection")
          }}</router-link></template
        >
        ></i18n-t
      >
    </b-alert>
    <span v-else>
      {{ $t("Montrer les magazines en vente par") }}
      <b-form-select v-model="userIdFilter" size="sm">
        <b-form-select-option key="" :value="null">
          {{ $t("Tous les utilisateurs") }}
        </b-form-select-option>
        <b-form-select-option
          v-for="{ text, value } in sellerUserNames"
          :key="value"
          :value="value"
        >
          {{ text }}
        </b-form-select-option>
      </b-form-select>
    </span>
    <IssueList
      v-for="[publicationcode, issues] in Object.entries(
        issuesOnSaleByOthers.groupBy('publicationcode', '[]'),
      )"
      :key="publicationcode"
      :publicationcode="publicationcode"
      :custom-issues="
        userIdFilter
          ? issues?.filter(({ userId }) => userId === userIdFilter) || []
          : issues
      "
      on-sale-by-others
      :group-user-copies="false"
      context-menu-component-name="context-menu-on-sale-by-others"
      @launch-modal="launchModal"
    />
    <b-modal
      v-if="
        modalContactId &&
        issuesOnSaleById &&
        contactMethods &&
        stats?.[modalContactId]
      "
      v-model="showModal"
      no-fade
      :ok-title="
        $t(
          modalContactMethod === 'email'
            ? 'J\'ai envoyé l\'e-mail au vendeur'
            : 'J\'ai envoyé le message au vendeur',
        )
      "
      :cancel-title="$t('Annuler')"
      @ok="
        requestIssues(modalIssueIds!);
        loadIssueRequestsAsBuyer(true);
      "
      ><template #title
        >{{ $t("Contacter") }} {{ stats[modalContactId].username }}</template
      >
      <header>
        {{ $t("Pour contacter") }} {{ stats[modalContactId].username }},
        <template v-if="modalContactMethod === 'email'"
          >{{ $t("envoyez-lui un e-mail à l'adresse") }}
          <a :href="`mailto:${contactMethods[modalContactId].email}`">{{
            contactMethods[modalContactId].email
          }}</a
          >. {{ $t("Voici un modèle d'e-mail possible :") }}</template
        ><template v-if="modalContactMethod === 'discordId'"
          >{{
            $t(
              "contactez cet utilisateur en lui envoyant un message sur Discord en cliquant sur",
            )
          }}
          <a
            target="_blank"
            :href="`https://discord.com/users/${contactMethods[modalContactId].discordId}`"
            >{{ $t("ce lien") }}</a
          >. {{ $t("Voici un modèle de message possible :") }}</template
        >
      </header>
      <blockquote class="m-3 p-4 border border-1 border-secondary">
        <p>
          {{ $t("Bonjour") }}&nbsp;{{ stats[modalContactId].username }}
          !
        </p>
        <p>
          {{
            $t(
              "Les numéros suivants que vous avez mis en vente sur DucksManager m'intéressent. Sont-ils toujours disponibles et, si oui, quel prix souhaiteriez-vous ?",
            )
          }}
        </p>
        <div v-for="issueId of modalIssueIds" :key="issueId">
          <issue
            hide-condition
            :issuecode="issuesOnSaleById[issueId].issuecode"
          />
        </div>
        <p class="mt-4">
          {{ $t("Merci d'avance pour votre réponse !") }}
        </p>
        <p>{{ user!.username }}</p>
      </blockquote>

      <b-alert
        :model-value="stats[modalContactId].marketplaceAcceptsExchanges"
        variant="warning"
        class="mt-4"
        >{{
          $t(
            "Cet utilisateur ne souhaite pas échanger des numéros, seulement en vendre.",
          )
        }}
      </b-alert>
    </b-modal>
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
const isTouchScreen = window.matchMedia("(pointer: coarse)").matches;

let showModal = $ref(false);
let modalContactId = $ref<number | null>(null);
let modalContactMethod = $ref<string | null>(null);
let modalIssueIds = $ref<number[] | null>(null);

const { user } = storeToRefs(collection());

const {
  deleteRequestToSeller,
  loadIssueRequestsAsBuyer,
  loadIssuesOnSaleByOthers,
  requestIssues,
} = marketplace();
const {
  contactMethods,
  sentRequestIssueIds,
  requestIssueIdsBySellerId,
  issuesOnSaleById,
  issueRequestsAsBuyer,
  sellerUserNames,
  issuesOnSaleByOthers,
  sellerUserIds,
} = storeToRefs(marketplace());

const { fetchPublicationNames } = coa();

const { fetchStats } = users();
const { stats } = storeToRefs(users());

let hasPublicationNames = $ref(false);
let userIdFilter = $ref<number | undefined>(undefined);

const launchModal = (e: {
  sellerId: number;
  contactMethod: string;
  selectedIssueIds: number[];
}) => {
  showModal = true;
  modalContactId = e.sellerId;
  modalContactMethod = e.contactMethod;
  modalIssueIds = e.selectedIssueIds;
};

const isRequestBooked = (thisIssueId: number) =>
  issueRequestsAsBuyer.value?.find(({ issueId }) => thisIssueId === issueId)
    ?.isBooked;

(async () => {
  await loadIssuesOnSaleByOthers();
  await loadIssueRequestsAsBuyer();

  await fetchStats(sellerUserIds.value);
  await fetchPublicationNames(Object.keys(issuesOnSaleByOthers || {}));
  hasPublicationNames = true;
})();
</script>
