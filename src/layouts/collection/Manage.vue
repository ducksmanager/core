<template>
  <div v-if="publicationcode === 'new'">
    {{
      $t(
        "Remplissez les informations ci-dessous pour que DucksManager détermine le nouveau magazine pour lequel vous souhaitez ajouter des numéros.",
      )
    }}
    <PublicationSelect />
    <br>
    <br>
    {{
      $t(
        "... ou recherchez un magazine à partir d'une histoire qui le contient :",
      )
    }}
    <IssueSearch />
  </div>
  <div v-else-if="hasPublicationNames">
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
            (e) => {
              suggestionsNumber = e;
            }
          "
        />
      </template>
      <template #footer>
        <div>
          <a :href="r('/expand')">{{
            $t("Voir toutes les suggestions d'achat pour ma collection")
          }}</a>
        </div>
      </template>
    </Accordion>
    <LastPurchases v-if="total > 0 && hasPublicationNames" />
    <LastPublishedEdges />
    <div v-if="username === 'demo'" id="demo-intro">
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
        <div class="mb-3">
          {{
            $t(
              'Cliquez sur "Nouveau magazine" pour ajouter un numéro dans votre liste.',
            )
          }}
        </div>
      </template>
      <template #non-empty-collection>
        <div class="mb-3">
          {{ $t("Cliquez sur l'un de vos magazines pour éditer sa liste !") }}
        </div>
      </template>
    </ShortStats>
    <PublicationList />
    <IssueList
      v-if="publicationcode || mostPossessedPublication"
      :publicationcode="publicationcode || mostPossessedPublication"
    />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'

import { coa } from '~/stores/coa'
import { collection } from '~/stores/collection'
import { l10n } from '~/stores/l10n'
import { user } from '~/composables/global'

defineProps({
  publicationcode: {
    type: String,
    default: null,
  },
})

const suggestionsNumber = $ref(0)
let hasPublicationNames = $ref(false)
const username = user().username
const publicationNames = $computed(() => coa().publicationNames)
const total = $computed(() => collection().total)
const totalPerPublication = $computed(() => collection().totalPerPublication)
const mostPossessedPublication = $computed(
  () =>
    totalPerPublication
      && Object.keys(totalPerPublication).reduce(
        (acc, publicationCode) =>
          totalPerPublication[acc] > totalPerPublication[publicationCode]
            ? acc
            : publicationCode,
        null,
      ),
)
const fetchPublicationNames = coa().fetchPublicationNames
const { r } = l10n()

watch(
  () => totalPerPublication,
  async (newValue) => {
    if (newValue) {
      await fetchPublicationNames(Object.keys(newValue))
      hasPublicationNames = true
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await collection().loadCollection();
  await coa().fetchCountryNames();
});
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
