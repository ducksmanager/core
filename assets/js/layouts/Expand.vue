<template>
  <div v-if="collection">
    <b-alert
      variant="info"
      show
    >
      {{ $t("DucksManager se base sur les") }}
      <a :href="$r('/stats/authors')">{{ $t("notes que vous attribuez à vos auteurs préférés") }}</a>
      {{ $t("pour vous proposer des magazines susceptibles de vous intéresser.") }}
      <br><br>
      {{ $t("Les suggestions d'achat sont mises à jour quotidiennement.") }}
    </b-alert>
    <div v-if="!watchedAuthors">
      {{ $t("Chargement...") }}
    </div>
    <div v-else-if="watchedAuthors.length && watchedAuthorsWithNotation.length">
      {{ $t("Montrer les magazines de") }}
      <b-select
        v-if="countryNamesWithAllCountriesOption"
        v-model="countryCode"
        size="sm"
      >
        <b-form-select-option
          v-for="(text, value) in countryNamesWithAllCountriesOption"
          :key="value"
          :value="value"
        >
          {{ text }}
        </b-form-select-option>>
      </b-select>
      <SuggestionList
        :countrycode="countryCode"
        :since-last-visit="false"
      />
    </div>
    <b-alert
      v-else-if="!watchedAuthorsWithNotation.length"
      show
      variant="warning"
    >
      {{ $t("Vous n'avez pas encore noté vos auteurs favoris. Attribuez des notes à vos auteurs préférés pour que DucksManager vous suggère des numéros à ajouter à votre collection.")
      }}
    </b-alert>
    <b-alert
      v-else
      show
      variant="warning"
    >
      {{ $t("Aucun auteur noté.") }}
      <span
        v-html="$t('Rendez vous sur la page {0} pour noter vos auteurs préférés.', [
          `<a :href='${$r('/stats/authors')}'>${$t(`Statistiques sur les auteurs`)}</a>`
        ])"
      />
      {{ $t("Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser.") }}
    </b-alert>
  </div>
</template>

<script>
import {collection} from "../composables/collection";
import { mapActions, mapState } from "pinia";
import SuggestionList from "./SuggestionList";
import {BAlert, BFormSelect} from "bootstrap-vue-3";
import { coa } from "../stores/coa";
const { collection: collectionStore } = require('../stores/collection');
import { l10n } from "../stores/l10n";

export default {
  name: "Expand",
  components: { SuggestionList, BAlert, BSelect: BFormSelect },

  data: () => ({
    countryCode: "ALL"
  }),

  computed: {
    ...mapState(collectionStore, ["watchedAuthors", "suggestions", "hasSuggestions"]),
    ...mapState(coa, ["countryNames"]),

    countryNamesWithAllCountriesOption() {
      return this.countryNames && {
        ALL: this.$t("Tous les pays"),
        ...this.countryNames
      };
    },

    watchedAuthorsWithNotation() {
      return this.watchedAuthors && this.watchedAuthors.filter(({ notation }) => notation > 0);
    }
  },

  watch: {
    async watchedAuthors(newValue) {
      if (newValue && newValue.length) {
        await this.fetchCountryNames();
      }
    }
  },

  async mounted() {
    await this.loadWatchedAuthors();
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
    ...mapActions(collection, ["loadWatchedAuthors"]),
    ...mapActions(coa, ["fetchCountryNames"])
  }
};
</script>

<style scoped lang="scss">
select {
  width: 300px;
}
</style>
