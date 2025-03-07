<template>
  <b-row v-if="indexationId && hasData" class="d-flex h-100">
    <b-col :cols="6" class="d-flex flex-column h-100">
      <Gallery v-if="activeTab === 'pageGallery'" :pages="indexation.pages" />
      <DumiliBook
        v-else-if="activeTab === 'book' && firstPageDimensions"
        v-bind="{ firstPageDimensions, indexation }"
      />
      <TextEditor v-else-if="activeTab === 'textEditor'" />
      <b-container
        v-if="activeTab !== undefined"
        class="start-0 bottom-0 mw-100 pt-2"
        style="height: 35px"
        ><b-tabs v-model:model-value="activeTabIndex" align="center"
          ><b-tab
            v-for="tabName of tabNames"
            :key="tabName"
            :button-id="tabName"
            :title="$t(tabName)" /></b-tabs
      ></b-container>
    </b-col>

    <b-col :cols="6" class="h-100">
      <table-of-contents />
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import { suggestions } from "~/stores/suggestions";
import { tabs } from "~/stores/tabs";
import type { FullIndexation } from "~dumili-services/indexation/types";

const route = useRoute();

const { t: $t } = useI18n();

const { activeTab } = storeToRefs(tabs());
const activeTabIndex = computed({
  get: () => Object.keys(tabs().tabNames).indexOf(activeTab.value),

  set(value) {
    tabs().activeTab = Object.keys(tabs().tabNames)[
      value
    ] as typeof activeTab.value;
  },
});

const { tabNames } = tabs();

const { fetchPublicationNames, fetchStoryDetails, fetchStoryversionDetails } =
  coa();
const { storyDetails } = storeToRefs(coa());

const indexationId = ref<string | null>(null);

const { loadIndexation } = suggestions();
const { indexation } = storeToRefs(suggestions()) as {
  indexation: Ref<FullIndexation>;
};

const hasData = ref(false);

const firstPageDimensions = ref<{ width: number; height: number } | null>(null);

watch(
  () => route.params.id,
  async (id) => {
    indexationId.value = id as string;
    await loadIndexation(indexationId.value);
    await fetchPublicationNames(
      indexation.value.issueSuggestions.map(
        ({ publicationcode }) => publicationcode,
      ),
    );

    const storycodes = indexation
      .value!.entries.map(({ storySuggestions }) =>
        storySuggestions
          .map(({ storycode }) => storycode)
          .filter((v): v is string => !!v),
      )
      .flat();
    await fetchStoryDetails(storycodes);
    await fetchStoryversionDetails(
      storycodes
        .map(
          (storycode) =>
            storyDetails.value[storycode]?.originalstoryversioncode,
        )
        .filter((v): v is string => !!v),
    );
    if (indexation.value.pages.some(({ image }) => image)) {
      const { output }: { output: { height: number; width: number } } = await (
        await fetch(
          indexation.value.pages
            .find(({ image }) => image)!
            .image!.url.replace(/(?=\/v\d+)/, "/fl_getinfo"),
        )
      ).json();
      firstPageDimensions.value = output;
    }
    hasData.value = true;
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
