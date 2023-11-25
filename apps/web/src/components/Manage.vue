<template>
  <div
    v-if="
      hasPublicationNames && issuesInOnSaleStack && marketplaceContactMethods
    "
  >
    <b-alert
      variant="warning"
      :model-value="
        issuesInOnSaleStack.length && !marketplaceContactMethods.length
      "
      >{{
        $t(
          "Vous n'avez pas indiqué de moyen de contact pour les collectionneurs intéressés par vos numéros.",
        )
      }}<br /><router-link to="/collection/account">{{
        $t(
          "Si vous souhaitez vendre des numéros, indiquez au moins un moyen de contact.",
        )
      }}</router-link></b-alert
    >
    <Accordion
      v-if="suggestionsNumber"
      id="suggestions"
      accordion-group-id="suggestions"
    >
      <template #header>
        {{
          suggestionsNumber === 1
            ? $t(
                "Depuis votre dernière visite, {0} magazine avec des histoires que vous ne possédez pas de vos auteurs préférés est sorti !",
              )
            : $t(
                "Depuis votre dernière visite, {0} magazines avec des histoires que vous ne possédez pas de vos auteurs préférés sont sortis !",
                suggestionsNumber,
              )
        }}
      </template>
      <template #content>
        <SuggestionList
          countrycode="ALL"
          since-last-visit
          @has-suggestions-data="
            (e: number) => {
              suggestionsNumber = e;
            }
          "
        />
      </template>
      <template #footer>
        <div>
          <router-link to="/expand/suggestions">{{
            $t("Voir toutes les suggestions d'achat pour ma collection")
          }}</router-link>
        </div>
      </template>
    </Accordion>
    <LastPurchases v-if="total && total > 0 && hasPublicationNames" />
    <LastPublishedEdges />
    <div v-if="user?.username === 'demo'" id="demo-intro">
      <h2>{{ $t("Bienvenue dans le mode démo !") }}</h2>
      <span
        class="pre-wrap"
        v-html="
          $t(
            'Prenez le temps de découvrir les fonctionnalités de DucksManager.\n\nVous pouvez ajouter ou supprimer des numéros de la collection de demo, mais souvenez-vous que toutes les heures les modifications entrées par les utilisateurs seront effacées.\nSi vous souhaitez vous déconnecter afin de vous inscrire ou de vous connecter avec votre compte réel, cliquez sur le lien Déconnexion dans le menu à gauche de cette page.\nProchaine remise à zéro dans',
          )
        "
      />
      {{ 60 - new Date().getMinutes() || 60 }} {{ $t("minute(s)") }}
    </div>
    <ShortStats>
      <template #empty-collection>
        <b-alert :model-value="true" variant="info" class="mb-3">
          {{ $t("Votre collection est vide.") }}
          {{
            $t(
              'Cliquez sur "Nouveau magazine" pour ajouter un numéro dans votre liste.',
            )
          }}
        </b-alert>
      </template>
      <template #non-empty-collection>
        <div class="mb-3">
          {{ $t("Cliquez sur l'un des magazines pour éditer sa liste !") }}
        </div>
      </template>
    </ShortStats>
    <PublicationList />
    <IssueList
      v-if="publicationcode || mostPossessedPublication"
      :publicationcode="(publicationcode || mostPossessedPublication)!"
    />
  </div>
</template>

<script setup lang="ts">
const { publicationcode = null } = defineProps<{
  publicationcode: string | null;
}>();

const suggestionsNumber = $ref(0 as number);
let hasPublicationNames = $ref(false as boolean);

const { loadCollection, loadPurchases, loadMarketplaceContactMethods } =
  collection();

const {
  marketplaceContactMethods,
  issuesInOnSaleStack,
  user,
  total,
  totalPerPublication,
  mostPossessedPublication,
} = storeToRefs(collection());

const { fetchStats } = users();

const { fetchPublicationNames, fetchCountryNames } = coa();

const {
  loadIssuesOnSaleByOthers,
  loadIssueRequestsAsBuyer,
  loadIssueRequestsAsSeller,
} = marketplace();

const { buyerUserIds, sellerUserIds } = storeToRefs(marketplace());

watch(
  totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(Object.keys(newValue));
      hasPublicationNames = true;
    }
  },
  { immediate: true },
);

(async () => {
  await loadCollection();
  await loadPurchases();
  await loadMarketplaceContactMethods();
  await fetchCountryNames();

  await loadIssuesOnSaleByOthers();
  await loadIssueRequestsAsBuyer();
  await loadIssueRequestsAsSeller();

  await fetchStats(buyerUserIds.value);
  await fetchStats(sellerUserIds.value);
})();
</script>

<style scoped lang="scss">
@import "~/styles/main";

#demo-intro {
  border: 1px solid white;
  margin-bottom: 20px;
  padding: 5px 10px 10px 15px;

  h2 {
    text-align: center;
  }
}

#publication-list {
  top: 0;
  margin-bottom: 20px;
  z-index: 1;
}

.navbar {
  .navbar-nav {
    flex-wrap: wrap;

    .navbar-nav {
      max-height: 200px;
      overflow-y: auto;
    }
  }

  a {
    border: none;
  }
}

@media (max-width: 767px) {
  #publication-list {
    top: $navbar-height;
  }
}
</style>
