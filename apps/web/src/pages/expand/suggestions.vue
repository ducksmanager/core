<route lang="yaml">
alias: [/agrandir/suggestions]
</route>

<template>
  <div v-if="issues">
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
    <div v-if="!ratings">
      {{ $t("Chargement...") }}
    </div>
    <div v-else-if="ratings.length && watchedAuthorsWithNotation!.length">
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
          "Vous n'avez pas encore noté vos auteurs favoris. Attribuez des notes à vos auteurs préférés pour que DucksManager vous suggère des numéros à ajouter à votre collection.",
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
          "Grâce à ces notes, DucksManager déterminera ensuite les magazines susceptibles de vous intéresser.",
        )
      }}
    </b-alert>
  </div>
</template>

<script setup lang="ts">
const countryCode = $ref("ALL" as string);
const { t: $t } = useI18n();

const { loadCollection } = collection();
const { issues } = storeToRefs(collection());

const { loadRatings } = stats();
const { ratings } = storeToRefs(stats());

const { fetchCountryNames } = coa();
const { countryNames } = storeToRefs(coa());

const countryNamesWithAllCountriesOption = $computed(
  () =>
    countryNames.value && [
      {
        value: "ALL",
        text: $t("Tous les pays"),
      },
      ...Object.entries(countryNames.value)
        .map(([value, text]) => ({ text, value }))
        .sort(({ text: text1 }, { text: text2 }) => text1.localeCompare(text2)),
    ],
);
const watchedAuthorsWithNotation = $computed(() =>
  ratings.value?.filter(({ notation }) => notation > 0),
);

watch(
  ratings,
  async (newValue) => {
    if (newValue?.length) await fetchCountryNames();
  },
  { immediate: true },
);

loadCollection();
loadRatings();
</script>

<style scoped lang="scss">
select {
  width: 300px;
}
</style>
