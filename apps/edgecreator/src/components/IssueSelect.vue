<template>
  <div v-if="countryNames">
    <b-form-select
      v-model="currentCountrycode"
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
      v-show="currentCountrycode"
      v-model="currentPublicationcode"
      :options="publications"
      @change="emit('change', null)"
    />
    <template v-if="currentCountrycode && currentPublicationcode">
      <template v-if="withEdgeGallery">
        <edge-gallery
          v-if="edgeCatalogStore.isCatalogLoaded"
          :publicationcode="currentPublicationcode"
          :selected="currentFirstIssue"
          :has-more-before="hasMoreIssuesToLoad.before"
          :has-more-after="hasMoreIssuesToLoad.after"
          @load-more="
            surroundingIssuesToLoad = {
              ...surroundingIssuesToLoad,
              [$event]: surroundingIssuesToLoad[$event as string] + 10,
            }
          "
          @change="
            currentFirstIssue = $event;
            onChange();
          "
        />
        <b-alert v-else :model-value="true" variant="info"
          >{{ $t("Loading...") }}
        </b-alert>
      </template>
      <template v-else>
        <b-form-select
          v-show="currentPublicationcode"
          v-model="currentFirstIssue"
          :options="issues"
          @change="onChange()"
        >
          <template #first>
            <b-form-select-option :value="undefined" disabled>{{
              $t("Select an issue number")
            }}</b-form-select-option>
          </template>
        </b-form-select>
        <template v-if="canBeMultiple && currentFirstIssue !== null">
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
            v-model="currentLastIssue"
            :options="issues"
            @change="onChange()"
          />
        </template>
      </template>
    </template>
    <slot v-if="$slots.dimensions && currentFirstIssue !== null" />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { edgeCatalog } from "~/stores/edgeCatalog";
import { stores as webStores } from "~web";

const { t: $t } = useI18n();

const edgeCatalogStore = edgeCatalog();
const coaStore = webStores.coa();

interface Selection {
  editMode: "single" | "range";
  countrycode: string;
  publicationcode: string;
  issuecode: string;
  issuenumberEnd?: string;
}

const emit = defineEmits<(e: "change", value: Selection | null) => void>();

const props = withDefaults(
  defineProps<{
    countrycode?: string | null;
    publicationcode?: string | null;
    canBeMultiple?: boolean;
    disableOngoingOrPublished: boolean;
    disableNotOngoingNorPublished: boolean;
    withEdgeGallery?: boolean;
    baseIssuenumbers?: string[];
  }>(),
  {
    countrycode: null,
    publicationcode: null,
    canBeMultiple: false,
    edgeGallery: false,
    baseIssuenumbers: () => [],
  },
);

interface IssuecodeAndNumber {
  issuecode: string;
  issuenumber: string;
}

const currentCountrycode = ref<string | undefined>(undefined);
const currentPublicationcode = ref<string | undefined>(undefined);
const currentFirstIssue = ref<IssuecodeAndNumber | undefined>(undefined);
const currentLastIssue = ref<IssuecodeAndNumber | undefined>(undefined);
const editMode = ref<"single" | "range">("single");
const hasMoreIssuesToLoad = ref({ before: false, after: false });
const surroundingIssuesToLoad = ref({ before: 10, after: 10 } as Record<
  string,
  number
>);

const countryNames = computed(
  () =>
    coaStore.countryNames &&
    Object.entries(coaStore.countryNames)
      .map(([countrycode, countryName]) => ({
        text: countryName,
        value: countrycode,
      }))
      .sort(({ text: text1 }, { text: text2 }) =>
        text1! < text2! ? -1 : text2! < text1! ? 1 : 0,
      ),
);
const publications = computed(
  () =>
    coaStore.publicationNames &&
    Object.keys(coaStore.publicationNames)
      .filter((publicationcode) =>
        publicationcode.startsWith(`${currentCountrycode.value!}/`),
      )
      .map((publicationcode) => ({
        text: coaStore.publicationNames[publicationcode],
        value: publicationcode,
      }))
      .filter(({ text }) => text !== null)
      .sort(({ text: text1 }, { text: text2 }) =>
        text1! < text2! ? -1 : text2! < text1! ? 1 : 0,
      ),
);

const publicationIssues = computed(
  () => coaStore.issuenumbers[currentPublicationcode.value!],
);

const issues = computed(
  () =>
    publicationIssues.value &&
    edgeCatalogStore.publishedEdges[currentPublicationcode.value!] &&
    coaStore.issuenumbers[currentPublicationcode.value!].map(
      (issuenumber, idx) => {
        const issuecode =
          coaStore.issuecodes[currentPublicationcode.value!][idx];
        const status = edgeCatalogStore.getEdgeStatus({
          country: currentCountrycode.value!,
          magazine: currentPublicationcode.value!.split("/")[1],
          issuenumber,
          issuecode,
        });
        return {
          value: { issuecode, issuenumber },
          text: `${issuenumber}${status === "none" ? "" : ` (${$t(status!)})`}`,
          disabled:
            (props.disableOngoingOrPublished && status !== "none") ||
            (props.disableNotOngoingNorPublished && status === "none"),
        };
      },
    ),
);

watch(
  currentCountrycode,
  async (newValue) => {
    if (newValue) {
      currentPublicationcode.value = props.publicationcode!;
      currentFirstIssue.value = undefined;

      await coaStore.fetchPublicationNamesFromCountry(newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(currentPublicationcode, async (newValue) => {
  if (newValue) {
    currentFirstIssue.value = undefined;
    await coaStore.fetchIssueNumbers([newValue]);
    await loadEdges();
  }
});

watch(surroundingIssuesToLoad, async () => await loadEdges());

if (props.countrycode) {
  currentCountrycode.value = props.countrycode;
}

const loadEdges = async () => {
  let issueNumbersFilter = "";
  if (props.withEdgeGallery) {
    const minBaseIssueNumberIndex = publicationIssues.value.indexOf(
      props.baseIssuenumbers[0],
    );
    const maxBaseIssueNumberIndex = publicationIssues.value.indexOf(
      props.baseIssuenumbers[props.baseIssuenumbers.length - 1],
    );
    issueNumbersFilter = `/${publicationIssues.value
      .filter(
        (issuenumber, index) =>
          minBaseIssueNumberIndex - index <
            surroundingIssuesToLoad.value.before &&
          index - maxBaseIssueNumberIndex <
            surroundingIssuesToLoad.value.after &&
          !props.baseIssuenumbers.includes(issuenumber),
      )
      .join(",")}`;
    hasMoreIssuesToLoad.value = {
      before: issueNumbersFilter[0] !== publicationIssues.value[0],
      after:
        issueNumbersFilter[issueNumbersFilter.length] !==
        publicationIssues.value[publicationIssues.value.length],
    };
  }

  await edgeCatalogStore.fetchPublishedEdges(currentPublicationcode.value!);
};

const onChange = () => {
  emit("change", {
    editMode: editMode.value,
    countrycode: currentCountrycode.value!,
    publicationcode: currentPublicationcode.value!,
    issuecode: currentFirstIssue.value!.issuecode,
    issuenumberEnd: currentLastIssue.value?.issuenumber,
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
