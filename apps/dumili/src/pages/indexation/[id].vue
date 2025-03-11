<template>
  <b-row v-if="hasData" class="d-flex h-100">
    <b-col :cols="6" class="d-flex flex-column h-100">
      <Gallery v-if="activeTabIndex === 0" :pages="indexation.pages" />
      <DumiliBook
        v-else-if="activeTabIndex === 1 && firstPageDimensions"
        v-bind="{ firstPageDimensions, indexation }"
      />
      <TextEditor v-else-if="activeTabIndex === 2" />
      <b-container class="start-0 bottom-0 mw-100 pt-2" style="height: 35px"
        ><b-tabs v-model:model-value="activeTabIndex" align="center"
          ><b-tab
            v-for="{ id, label } of tabNames"
            :key="id"
            :button-id="id"
            :title="label" /></b-tabs
      ></b-container>
    </b-col>

    <b-col :cols="6" class="h-100">
      <table-of-contents />
    </b-col>
  </b-row>
  <h4 v-else-if="indexation === null">
    {{
      $t("Cette indexation n'existe pas ou appartient à un autre utilisateur.")
    }}
  </h4>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { tabs } from "~/stores/tabs";
import type { FullIndexation } from "~dumili-services/indexation";

const route = useRoute();

const { t: $t } = useI18n();

const { activeTabIndex } = storeToRefs(tabs());
const { tabNames } = tabs();

const { fetchPublicationNames, fetchStoryDetails, fetchStoryversionDetails } =
  coa();
const { storyDetails } = storeToRefs(coa());

const { loadIndexation } = suggestions();
const { indexation } = storeToRefs(suggestions()) as {
  indexation: Ref<FullIndexation>;
};

const hasData = ref(false);

const firstPageDimensions = ref<{ width: number; height: number }>();

watch(indexation, async (indexation) => {
  if (!indexation) return;
  await fetchPublicationNames(
    indexation.issueSuggestions.map(({ publicationcode }) => publicationcode),
  );

  const storycodes = indexation.entries
    .map(({ storySuggestions }) =>
      storySuggestions
        .map(({ storycode }) => storycode)
        .filter((v): v is string => !!v),
    )
    .flat();
  await fetchStoryDetails(storycodes);
  await fetchStoryversionDetails(
    storycodes
      .map(
        (storycode) => storyDetails.value[storycode]?.originalstoryversioncode,
      )
      .filter((v): v is string => !!v),
  );
  if (indexation.pages.some(({ image }) => image)) {
    const { output }: { output: { height: number; width: number } } = await (
      await fetch(
        indexation.pages
          .find(({ image }) => image)!
          .image!.url.replace(/(?=\/v\d+)/, "/fl_getinfo"),
      )
    ).json();
    firstPageDimensions.value = output;
  }
  hasData.value = true;
});

watch(
  () => route.params.id,
  async (id) => {
    await loadIndexation(id as string);
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
#main {
  max-height: calc(100vh - 108px);
}

.col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-control::placeholder {
  color: red !important;
}
</style>
