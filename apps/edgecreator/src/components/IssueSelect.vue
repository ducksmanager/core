<template>
  <div v-if="countries">
    <b-form-select
      v-model="currentCountrycode"
      :options="countries"
      @change="emit('change', null)"
    >
      <template #first>
        <b-form-select-option :value="undefined" disabled>
          {{ $t("Select a country") }}
        </b-form-select-option>
      </template>
    </b-form-select>
    <b-form-select
      v-show="currentCountrycode"
      v-model="currentPublicationcode"
      :options="publications"
      @change="emit('change', null)"
    />
    <template v-if="currentCountrycode && currentPublicationcode">
      <template v-if="withEdgeGallery">
        <edge-gallery
          v-if="isCatalogLoaded"
          :publicationcode="currentPublicationcode"
          :selected="currentFirstIssuecode"
          :has-more-before="hasMoreIssuesToLoad.before"
          :has-more-after="hasMoreIssuesToLoad.after"
          @load-more="
            surroundingIssuesToLoad = {
              ...surroundingIssuesToLoad,
              [$event]: surroundingIssuesToLoad[$event as string] + 10,
            }
          "
          @change="
            currentFirstIssuecode = $event.issuecode;
            onChange();
          "
        />
        <b-alert v-else :model-value="true" variant="info">
          {{ $t("Loading...") }}
        </b-alert>
      </template>
      <template v-else>
        <b-form-select
          v-show="currentPublicationcode"
          v-model="currentFirstIssuecode"
          :options="issues"
          @change="onChange()"
        >
          <template #first>
            <b-form-select-option :value="undefined" disabled>
              {{ $t("Select an issue number") }}
            </b-form-select-option>
          </template>
        </b-form-select>
        <template v-if="canBeMultiple && currentFirstIssuecode !== undefined">
          <b-form-group class="mt-2">
            <b-form-radio v-model="editMode" name="editMode" value="single">
              {{ $t("Edit a single edge") }}
            </b-form-radio>
            <b-form-radio v-model="editMode" name="editMode" value="range">
              {{ $t("Edit a range of edges (e.g. issues 1 to 3)") }}
            </b-form-radio>
          </b-form-group>
          <b-form-select
            v-show="editMode === 'range'"
            v-model="currentLastIssuecode"
            :options="issues"
            @change="onChange()"
          />
        </template>
      </template>
    </template>
    <slot
      v-if="slots.dimensions && currentFirstIssuecode !== undefined"
      name="dimensions"
    />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { edgeCatalog } from "~/stores/edgeCatalog";
import { stores as webStores } from "~web";

const { t: $t } = useI18n();

const edgeCatalogStore = edgeCatalog();
const { isCatalogLoaded } = storeToRefs(edgeCatalogStore);

const coaStore = webStores.coa();
const {
  countryNames,
  publicationNames,
  issuecodesByPublicationcode,
  issuecodeDetails,
} = storeToRefs(coaStore);

const slots = defineSlots<{
  default(): never;
  dimensions?(): never;
}>();

interface Selection {
  editMode: "single" | "range";
  countrycode: string;
  publicationcode: string;
  issuecode: string;
  issuecodeEnd?: string;
}

const emit = defineEmits<(e: "change", value: Selection | null) => void>();

const {
  disableOngoingOrPublished,
  disableNotOngoingNorPublished,
  canBeMultiple = false,
  withEdgeGallery = false,
  publicationcode = null,
  countrycode = null,
  baseIssuenumbers = [],
} = defineProps<{
  countrycode?: string | null;
  publicationcode?: string | null;
  canBeMultiple?: boolean;
  disableOngoingOrPublished: boolean;
  disableNotOngoingNorPublished: boolean;
  withEdgeGallery?: boolean;
  baseIssuenumbers?: string[];
}>();

const currentCountrycode = ref<string>();
const currentPublicationcode = ref<string>();
const currentFirstIssuecode = ref<string>();
const currentLastIssuecode = ref<string>();
const editMode = ref<"single" | "range">("single");
const hasMoreIssuesToLoad = ref({ before: false, after: false });
const surroundingIssuesToLoad = ref({ before: 10, after: 10 } as Record<
  string,
  number
>);

const countries = computed(
  () =>
    countryNames.value &&
    Object.entries(countryNames.value)
      .map(([countrycode, countryName]) => ({
        text: countryName,
        value: countrycode,
      }))
      .sort(({ text: text1 }, { text: text2 }) =>
        text1 < text2 ? -1 : text2 < text1 ? 1 : 0,
      ),
);
const publications = computed(
  () =>
    publicationNames.value &&
    Object.keys(publicationNames.value)
      .filter((publicationcode) =>
        publicationcode.startsWith(`${currentCountrycode.value!}/`),
      )
      .map((publicationcode) => ({
        text: publicationNames.value[publicationcode],
        value: publicationcode,
      }))
      .filter(({ text }) => text !== null)
      .sort(({ text: text1 }, { text: text2 }) =>
        text1 < text2 ? -1 : text2 < text1 ? 1 : 0,
      ),
);

const publicationIssues = computed(
  () => issuecodesByPublicationcode.value[currentPublicationcode.value!],
);

const issues = computed(
  () =>
    publicationIssues.value &&
    coaStore.issuecodesByPublicationcode[currentPublicationcode.value!].map(
      (issuecode) => {
        const status =
          issuecode in edgeCatalogStore.publishedEdges
            ? "Published"
            : issuecode in edgeCatalogStore.ongoingEdges
              ? "Ongoing"
              : "none";
        return {
          value: { issuecode },
          text: `${issuecodeDetails.value[issuecode].issuenumber}${status === "none" ? "" : ` (${$t(status)})`}`,
          disabled:
            (disableOngoingOrPublished && status !== "none") ||
            (disableNotOngoingNorPublished && status === "none"),
        };
      },
    ),
);

watch(
  currentCountrycode,
  async (newValue) => {
    if (newValue) {
      currentPublicationcode.value = publicationcode!;
      currentFirstIssuecode.value = undefined;

      await coaStore.fetchPublicationNamesFromCountry(newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(currentPublicationcode, async (newValue) => {
  if (newValue) {
    currentFirstIssuecode.value = undefined;
    await coaStore.fetchIssuecodesByPublicationcode([newValue]);
    await loadEdges();
  }
});

watch(surroundingIssuesToLoad, async () => await loadEdges());

if (countrycode) {
  currentCountrycode.value = countrycode;
}

const loadEdges = async () => {
  let issueNumbersFilter = "";
  if (withEdgeGallery) {
    const minBaseIssueNumberIndex = publicationIssues.value.indexOf(
      baseIssuenumbers[0],
    );
    const maxBaseIssueNumberIndex = publicationIssues.value.indexOf(
      baseIssuenumbers[baseIssuenumbers.length - 1],
    );
    issueNumbersFilter = `/${publicationIssues.value
      .filter(
        (issuenumber, index) =>
          minBaseIssueNumberIndex - index <
            surroundingIssuesToLoad.value.before &&
          index - maxBaseIssueNumberIndex <
            surroundingIssuesToLoad.value.after &&
          !baseIssuenumbers.includes(issuenumber),
      )
      .join(",")}`;
    hasMoreIssuesToLoad.value = {
      before: issueNumbersFilter[0] !== publicationIssues.value[0],
      after:
        issueNumbersFilter[issueNumbersFilter.length] !==
        publicationIssues.value[publicationIssues.value.length],
    };
  }
};

const onChange = () => {
  emit("change", {
    editMode: editMode.value,
    countrycode: currentCountrycode.value!,
    publicationcode: currentPublicationcode.value!,
    issuecode: currentFirstIssuecode.value!,
    issuecodeEnd: currentLastIssuecode.value,
  });
};
(async () => {
  await coaStore.fetchCountryNames();
  await edgeCatalogStore.loadCatalog();
})();
</script>
<style scoped lang="scss">
:deep(select + div) {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 3px;
  margin-bottom: 10px;
}
:deep(.custom-control-input[type="checkbox"]) {
  position: static;
  width: 2rem;
}
</style>
