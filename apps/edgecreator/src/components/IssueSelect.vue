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
          v-if="currentPublicationcode in publishedEdges"
          v-model="currentFirstIssuecode"
          :publicationcode="currentPublicationcode"
          :has-more-before="hasMoreIssuesToLoad.before"
          :has-more-after="hasMoreIssuesToLoad.after"
          @load-more="
            surroundingIssuesToLoad = {
              ...surroundingIssuesToLoad,
              [$event]: surroundingIssuesToLoad[$event as string] + 10,
            }
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
const { publishedEdges } = storeToRefs(edgeCatalogStore);

const coaStore = webStores.coa();
const {
  countryNames,
  publicationNames,
  issuecodesByPublicationcode,
  issuecodeDetails,
} = storeToRefs(coaStore);
const {
  fetchPublicationNamesFromCountry,
  fetchIssuecodesByPublicationcode,
  fetchIssuecodeDetails,
  fetchCountryNames,
} = coaStore;

const slots = defineSlots<{
  default(): never;
  dimensions?(): never;
}>();

interface Selection {
  editMode: "single" | "range";
  countrycode: string | undefined;
  publicationcode: string | undefined;
  issuecode: string | undefined;
  issuecodeEnd?: string | undefined;
}

const emit = defineEmits<(e: "change", value: Selection | null) => void>();

const {
  disableOngoingOrPublished,
  disableNotOngoingNorPublished,
  canBeMultiple = false,
  withEdgeGallery = false,
  publicationcode = null,
  baseIssuecodes = [],
} = defineProps<{
  publicationcode?: string | null;
  canBeMultiple?: boolean;
  disableOngoingOrPublished: boolean;
  disableNotOngoingNorPublished: boolean;
  withEdgeGallery?: boolean;
  baseIssuecodes?: string[];
}>();

const currentCountrycode = ref<string | undefined>(
  publicationcode?.split("/")[0] || undefined,
);
const currentPublicationcode = ref<string | undefined>(
  publicationcode || undefined,
);
const currentFirstIssuecode = ref<string>();
const currentLastIssuecode = ref<string>();

const editMode = ref<"single" | "range">("single");
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
        publicationcode.startsWith(`${currentCountrycode.value}/`),
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

const issues = ref<
  {
    value: string;
    text: string;
    disabled: boolean;
  }[]
>([]);

watch(
  currentCountrycode,
  async (newValue) => {
    if (newValue) {
      currentPublicationcode.value = publicationcode!;
      currentFirstIssuecode.value = undefined;

      await fetchPublicationNamesFromCountry(newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(currentPublicationcode, async (newValue) => {
  if (newValue) {
    currentFirstIssuecode.value = undefined;
    await fetchIssuecodesByPublicationcode([newValue]);
    await fetchIssuecodeDetails(issuecodesByPublicationcode.value[newValue]);
    issues.value = issuecodesByPublicationcode.value[newValue].map(
      (issuecode) => {
        const status =
          issuecode in edgeCatalogStore.publishedEdges
            ? "Published"
            : issuecode in edgeCatalogStore.ongoingEdges
              ? "Ongoing"
              : "none";
        return {
          value: issuecode.replace(/ /g, "_"),
          text: `${issuecodeDetails.value[issuecode]?.issuenumber}${status === "none" ? "" : ` (${$t(status)})`}`,
          disabled:
            (disableOngoingOrPublished && status !== "none") ||
            (disableNotOngoingNorPublished && status === "none"),
        };
      },
    );
  }
});

const hasMoreIssuesToLoad = computed(() => {
  if (!publicationcode) {
    return { before: false, after: false };
  }
  const publishedIssuecodes = Object.keys(
    publishedEdges.value[publicationcode],
  );
  const minBaseIssuecodeIndex = publishedIssuecodes.indexOf(baseIssuecodes[0]);
  const maxBaseIssuecodeIndex = publishedIssuecodes.indexOf(
    baseIssuecodes[baseIssuecodes.length - 1],
  );
  const issuecodesFilter = publishedIssuecodes.filter(
    (issuecode, index) =>
      minBaseIssuecodeIndex - index < surroundingIssuesToLoad.value.before &&
      index - maxBaseIssuecodeIndex < surroundingIssuesToLoad.value.after &&
      !baseIssuecodes.includes(issuecode),
  );
  return {
    before: issuecodesFilter[0] !== publishedIssuecodes[0],
    after: [...issuecodesFilter].pop() !== [...publishedIssuecodes].pop(),
  };
});

watch([currentFirstIssuecode, currentLastIssuecode], () => {
  emit("change", {
    editMode: editMode.value,
    countrycode: currentCountrycode.value,
    publicationcode: currentPublicationcode.value!,
    issuecode: currentFirstIssuecode.value!,
    issuecodeEnd: currentLastIssuecode.value,
  });
});
(async () => {
  await fetchCountryNames();
  await edgeCatalogStore.fetchOngoingEdges();
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
