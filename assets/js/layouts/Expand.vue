<template>
  <div v-if="collection">
    <b-alert variant="info" show>
      {{ $t("DucksManager se base sur les") }}
      <a :href="r('/stats/authors')">{{
        $t("notes que vous attribuez à vos auteurs préférés")
      }}</a>
      {{
        $t("pour vous proposer des magazines susceptibles de vous intéresser.")
      }}
      <br /><br />
      {{ $t("Les suggestions d'achat sont mises à jour quotidiennement.") }}
    </b-alert>
    <div v-if="!watchedAuthors">
      {{ $t("Chargement...") }}
    </div>
    <div v-else-if="watchedAuthors.length && watchedAuthorsWithNotation.length">
      {{ $t("Montrer les magazines de") }}
      <b-form-select
        v-if="countryNamesWithAllCountriesOption"
        v-model="countryCode"
        size="sm"
      >
        <b-form-select-option
          v-for="(text, value) in countryNamesWithAllCountriesOption"
          :key="value"
          :value="value"
        >
          {{ text }} </b-form-select-option
        >>
      </b-form-select>
      <SuggestionList :countrycode="countryCode" :since-last-visit="false" />
    </div>
    <b-alert
      v-else-if="!watchedAuthorsWithNotation.length"
      show
      variant="warning"
    >
      {{
        $t(
          "Vous n'avez pas encore noté vos auteurs favoris. Attribuez des notes à vos auteurs préférés pour que DucksManager vous suggère des numéros à ajouter à votre collection."
        )
      }}
    </b-alert>
    <b-alert v-else show variant="warning">
      {{ $t("Aucun auteur noté.") }}
      <span
        v-html="
          $t('Rendez vous sur la page {0} pour noter vos auteurs préférés.', [
            `<a :href='${r('/stats/authors')}'>${$t(
              `Statistiques sur les auteurs`
            )}</a>`,
          ])
        "
      />
      {{
        $t(
          "Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser."
        )
      }}
    </b-alert>
  </div>
</template>

<script setup>
import { BAlert, BFormSelect } from "bootstrap-vue-3";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import { coa } from "../stores/coa";
import { collection as collectionStore } from "../stores/collection";
import { l10n } from "../stores/l10n";
import SuggestionList from "./SuggestionList";

let countryCode = $ref("ALL");
const { t: $t } = useI18n(),
  t = $t,
  { r } = l10n(),
  watchedAuthors = $computed(() => collectionStore().watchedAuthors),
  suggestions = $computed(() => collectionStore().suggestions),
  countryNames = $computed(() => coa().countryNames),
  countryNamesWithAllCountriesOption = $computed(
    () =>
      countryNames && {
        ALL: $t("Tous les pays"),
        ...countryNames,
      }
  ),
  watchedAuthorsWithNotation = $computed(() =>
    watchedAuthors?.filter(({ notation }) => notation > 0)
  ),
  loadWatchedAuthors = collectionStore().loadWatchedAuthors,
  fetchCountryNames = coa().fetchCountryNames;

watch(
  () => watchedAuthors,
  async (newValue) => {
    if (newValue?.length) {
      await fetchCountryNames();
    }
  }
);

onMounted(async () => {
  await loadWatchedAuthors();
});
</script>

<style scoped lang="scss">
select {
  width: 300px;
}
</style>
