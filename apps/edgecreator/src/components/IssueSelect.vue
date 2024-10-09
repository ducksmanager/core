<template>
  <div v-if="countryNames">
    <b-form-select
      v-model="currentCountryCode"
      :options="countryNames"
      @change="emit('change', null)"
    >
      <template #first>
        <b-form-select-option :value="undefined" disabled>{{
          $t("Select a country")
        }}</b-form-select-option>
      </template>
    </b-form-select>
    <b-form-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publications"
      @change="emit('change', null)"
    />
    <template v-if="currentCountryCode && currentPublicationCode">
      <template v-if="withEdgeGallery">
        <edge-gallery
          v-if="edgeCatalogStore.isCatalogLoaded"
          :publicationcode="currentPublicationCode"
          :selected="currentIssueNumber"
          :has-more-before="hasMoreIssuesToLoad.before"
          :has-more-after="hasMoreIssuesToLoad.after"
          @load-more="
            surroundingIssuesToLoad = {
              ...surroundingIssuesToLoad,
              [$event]: surroundingIssuesToLoad[$event as string] + 10,
            }
          "
          @change="
            currentIssueNumber = $event;
            onChange({});
          "
        />
        <b-alert v-else :model-value="true" variant="info"
          >{{ $t("Loading...") }}
        </b-alert>
      </template>
      <template v-else>
        <b-form-select
          v-show="currentCountryCode && currentPublicationCode"
          v-model="currentIssueNumber"
          :options="issues"
          @input="onChange({})"
        >
          <template #first>
            <b-form-select-option :value="undefined" disabled>{{
              $t("Select an issue number")
            }}</b-form-select-option>
          </template>
        </b-form-select>
        <template v-if="canBeMultiple && currentIssueNumber !== null">
          <b-form-group class="mt-2">
            <b-form-radio v-model="editMode" name="editMode" value="single">{{
              $t("Edit a single edge")
            }}</b-form-radio>
            <b-form-radio v-model="editMode" name="editMode" value="range">{{
              $t("Edit a range of edges (e.g. issues 1 to 3)")
            }}</b-form-radio>
          </b-form-group>
          <b-form-select
            v-show="editMode === 'range'"
            v-model="currentIssueNumberEnd"
            :options="issues"
            @input="onChange({})"
          />
        </template>
      </template>
    </template>
    <slot v-if="$slots.dimensions && currentIssueNumber !== undefined" name="dimensions" />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { edgeCatalog } from "~/stores/edgeCatalog";
import { Crop } from "~types/Crop";

const { t: $t, locale } = useI18n();

const edgeCatalogStore = edgeCatalog();
const coaStore = coa();

const emit = defineEmits<(e: "change", value: Crop | null) => void>();

const props = withDefaults(
  defineProps<{
    countryCode?: string | null;
    publicationCode?: string | null;
    canBeMultiple?: boolean;
    disableOngoingOrPublished: boolean;
    disableNotOngoingNorPublished: boolean;
    withEdgeGallery?: boolean;
    baseIssueNumbers?: string[];
  }>(),
  {
    countryCode: null,
    publicationCode: null,
    canBeMultiple: false,
    edgeGallery: false,
    baseIssueNumbers: () => [],
  },
);

const currentCountryCode = ref(undefined as string | undefined);
const currentPublicationCode = ref(undefined as string | undefined);
const currentIssueNumber = ref(undefined as string | undefined);
const currentIssueNumberEnd = ref(undefined as string | undefined);
const editMode = ref("single" as "single" | "range");
const hasMoreIssuesToLoad = ref({ before: false, after: false });
const surroundingIssuesToLoad = ref({ before: 10, after: 10 } as Record<
  string,
  number
>);

const countryNames = computed(() => coaStore.countryNames);
const publications = computed(
  () =>
    coaStore.publicationNames &&
    Object.keys(coaStore.publicationNames)
      .filter((publicationCode) =>
        publicationCode.startsWith(`${currentCountryCode.value!}/`),
      )
      .map((publicationCode) => ({
        text: coaStore.publicationNames[publicationCode],
        value: publicationCode,
      }))
      .filter(({ text }) => text !== null)
      .sort(({ text: text1 }, { text: text2 }) =>
        text1! < text2! ? -1 : text2! < text1! ? 1 : 0,
      ),
);

const publicationIssues = computed(
  () => coaStore.issueNumbers[currentPublicationCode.value!],
);

const issues = computed(
  () =>
    publicationIssues.value &&
    edgeCatalogStore.publishedEdges[currentPublicationCode.value!] &&
    coaStore.issueNumbers[currentPublicationCode.value!].map((issuenumber) => {
      const status = edgeCatalogStore.getEdgeStatus({
        country: currentCountryCode.value!,
        magazine: currentPublicationCode.value!.split("/")[1],
        issuenumber,
      });
      return {
        value: issuenumber,
        text: `${issuenumber}${status === "none" ? "" : ` (${$t(status!)})`}`,
        disabled:
          (props.disableOngoingOrPublished && status !== "none") ||
          (props.disableNotOngoingNorPublished && status === "none"),
      };
    }),
);

watch(
  currentCountryCode,
  async (newValue) => {
    if (newValue) {
      currentPublicationCode.value = props.publicationCode!;
      currentIssueNumber.value = undefined;

      await coaStore.fetchPublicationNamesFromCountry(newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(
  currentPublicationCode,
  async (newValue) => {
    if (newValue) {
      await coaStore.fetchIssueNumbers([newValue]);
      currentIssueNumber.value = coaStore.issueNumbers[newValue][0];
      currentIssueNumberEnd.value = coaStore.issueNumbers[newValue][0];
      onChange({});
      await loadEdges();
    }
  },
);

watch(
  () => surroundingIssuesToLoad.value,
  async () => await loadEdges(),
);

if (props.countryCode) {
  currentCountryCode.value = props.countryCode;
}

const loadEdges = async () => {
  let issueNumbersFilter = "";
  if (props.withEdgeGallery) {
    const minBaseIssueNumberIndex = publicationIssues.value.indexOf(
      props.baseIssueNumbers[0],
    );
    const maxBaseIssueNumberIndex = publicationIssues.value.indexOf(
      props.baseIssueNumbers[props.baseIssueNumbers.length - 1],
    );
    issueNumbersFilter = `/${publicationIssues.value
      .filter(
        (issueNumber, index) =>
          minBaseIssueNumberIndex - index <
            surroundingIssuesToLoad.value.before &&
          index - maxBaseIssueNumberIndex <
            surroundingIssuesToLoad.value.after &&
          !props.baseIssueNumbers.includes(issueNumber),
      )
      .join(",")}`;
    hasMoreIssuesToLoad.value = {
      before: issueNumbersFilter[0] !== publicationIssues.value[0],
      after:
        issueNumbersFilter[issueNumbersFilter.length] !==
        publicationIssues.value[publicationIssues.value.length],
    };
  }

  await edgeCatalogStore.fetchPublishedEdges(currentPublicationCode.value!);
};

const onChange = (
  data: { width: number; height: number } | Record<string, never>,
) =>
  emit("change", {
  width: data.width,
  height: data.height,
  editMode: editMode.value,
  countryCode: currentCountryCode.value!,
  publicationCode: currentPublicationCode.value!,
  issueNumber: currentIssueNumber.value!,
  issueNumberEnd: currentIssueNumberEnd.value!,
});

(async () => {
  await coaStore.fetchCountryNames(locale.value);
  await edgeCatalogStore.loadCatalog(false);
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
