<route lang="yaml">
alias: [/agrandir/suggestions]
</route>

<template>
  <div v-if="collection">
    <b-alert variant="info" :model-value="true">
      {{ $t("DucksManager se base sur les") }}
      <router-link to="/stats/authors">{{
        $t("notes que vous attribuez à vos auteurs préférés")
      }}</router-link>
      {{
        $t("pour vous proposer des magazines susceptibles de vous intéresser.")
      }}
      <br /><br />
      {{ $t("Les suggestions d'achat sont mises à jour quotidiennement.") }}
    </b-alert>
    <div v-if="!watchedAuthors">
      {{ $t("Chargement...") }}
    </div>
    <div
      v-else-if="watchedAuthors.length && watchedAuthorsWithNotation!.length"
    >
      {{ $t("Montrer les magazines de") }}
      <b-form-select
        v-if="countryNamesWithAllCountriesOption"
        v-model="countryCode"
        size="sm"
      >
        <b-form-select-option
          v-for="{ text, value } in countryNamesWithAllCountriesOption"
          :key="value"
          :value="value"
        >
          {{ text }}
        </b-form-select-option>
      </b-form-select>
      <suggestion-list :countrycode="countryCode" :since-last-visit="false" />
    </div>
    <b-alert
      v-else-if="!watchedAuthorsWithNotation!.length"
      :model-value="true"
      variant="warning"
    >
      {{
        $t(
          "Vous n'avez pas encore noté vos auteurs favoris. Attribuez des notes à vos auteurs préférés pour que DucksManager vous suggère des numéros à ajouter à votre collection."
        )
      }}
    </b-alert>
    <b-alert v-else :model-value="true" variant="warning">
      {{ $t("Aucun auteur noté.") }}
      <i18n-t
        keypath="Rendez vous sur la page {link_to_author_stats} pour noter vos auteurs préférés."
        ><template #link_to_author_stats
          ><router-link to="/stats/authors">{{
            $t(`Statistiques sur les auteurs`)
          }}</router-link>
        </template>
      </i18n-t>
      {{
        $t(
          "Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser."
        )
      }}
    </b-alert>
  </div>
</template>

<script setup lang="ts">
import { BAlert, BFormSelect, BFormSelectOption } from "bootstrap-vue-next";
import { onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import SuggestionList from "~/components/SuggestionList.vue";
import { coa } from "~/stores/coa";
import { collection as collectionStore } from "~/stores/collection";

const countryCode = $ref("ALL" as string);
const { t: $t } = useI18n();
const collection = $computed(() => collectionStore().collection);
const watchedAuthors = $computed(() => collectionStore().watchedAuthors);
const countryNames = $computed(() => coa().countryNames);
const countryNamesWithAllCountriesOption = $computed(
  () =>
    countryNames && [
      {
        value: "ALL",
        text: $t("Tous les pays"),
      },
      ...Object.entries(countryNames)
        .map(([value, text]) => ({ text, value }))
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2)),
    ]
);
const watchedAuthorsWithNotation = $computed(() =>
  watchedAuthors?.filter(({ notation }) => notation > 0)
);

watch(
  () => watchedAuthors,
  async (newValue) => {
    if (newValue?.length) await coa().fetchCountryNames();
  },
  { immediate: true }
);

onMounted(async () => {
  await collectionStore().loadCollection();
  await collectionStore().loadWatchedAuthors();
});
</script>

<style scoped lang="scss">
select {
  width: 300px;
}
</style>
