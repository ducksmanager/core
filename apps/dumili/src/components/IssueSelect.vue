<template>
  <div v-if="countryNames">
    <b-form-select
      v-model="currentCountrycode"
      :options="countryNames"
      @change="emit('change')"
    >
      <template #first>
        <b-form-select-option :value="undefined" disabled>{{
          $t("Sélectionnez un pays")
        }}</b-form-select-option>
      </template>
    </b-form-select>
    <b-form-select
      v-show="currentCountrycode"
      v-model="currentIssue.publicationcode"
      :options="publicationNamesForCurrentCountry"
      @change="emit('change')"
    />
    <template v-if="currentIssue.publicationcode">
      <b-form-input
        v-model="currentIssue.issuenumber"
        :placeholder="$t('Entrez le numéro')"
        :state="isValid"
      />
      <div class="invalid-feedback">
        <template v-if="['', undefined].includes(currentIssue.issuenumber)">{{
          $t("Veuillez entrer le numéro")
        }}</template
        ><template v-else-if="isIssueAlreadyReferenced">{{
          $t("Ce numéro est déjà référencé !")
        }}</template>
      </div>
    </template>
    <b-button
      variant="success"
      :disabled="!isValid"
      @click="emit('change', currentIssue as IndexationIssue)"
      >OK</b-button
    >
  </div>
</template>
<script setup lang="ts">
type IndexationIssue = {
  publicationcode: string;
  issuenumber: string;
};

const { t: $t } = useI18n();

const emit = defineEmits<(e: "change", data?: IndexationIssue) => void>();

const { issue } = defineProps<{
  issue: IndexationIssue | null;
}>();

const currentIssue = ref<Partial<IndexationIssue>>(issue!);

const currentCountrycode = ref<string>();

watch(
  () => issue,
  (newValue) => {
    if (newValue) {
      currentIssue.value = {
        publicationcode: newValue.publicationcode,
        issuenumber: newValue.issuenumber,
      };
    } else {
      currentIssue.value = {
        publicationcode: undefined,
        issuenumber: undefined,
      };
    }
    currentCountrycode.value =
      currentIssue.value.publicationcode?.split("/")[0];
  },
  { immediate: true },
);

const {
  countryNames: coaCountryNames,
  publicationNames,
  issuecodeDetails,
  issuecodesByPublicationcode,
  publicationNamesFullCountries,
} = storeToRefs(coa());
const {
  fetchPublicationNamesFromCountry,
  fetchIssuecodesByPublicationcode,
  fetchIssuecodeDetails,
  fetchCountryNames,
} = coa();

const issues = ref<{ issuecode: string; issuenumber: string }[]>([]);

const countryNames = computed(
  () =>
    (coaCountryNames.value &&
      Object.entries(coaCountryNames.value)
        .map(([countrycode, countryName]) => ({
          text: countryName,
          value: countrycode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2),
        )) ||
    undefined,
);

const publicationNamesForCurrentCountry = computed(() =>
  publicationNamesFullCountries.value.includes(currentCountrycode.value || "")
    ? Object.keys(publicationNames.value)
        .filter(
          (publicationcode) =>
            publicationcode.indexOf(`${currentCountrycode.value}/`) === 0,
        )
        .map((publicationcode) => ({
          text: publicationNames.value[publicationcode],
          value: publicationcode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2 || ""),
        )
    : [],
);

const isIssueAlreadyReferenced = computed(() =>
  issues.value?.some(
    ({ issuenumber }) => issuenumber === currentIssue.value.issuenumber,
  ),
);

const isValid = computed(
  () =>
    currentIssue.value.issuenumber !== undefined &&
    !isIssueAlreadyReferenced.value,
);

watch(
  currentCountrycode,
  async (newValue) => {
    if (newValue) {
      if (newValue !== currentIssue.value?.publicationcode?.split("/")[0]) {
        currentIssue.value = {
          publicationcode: undefined,
          issuenumber: undefined,
        };
      }
      await fetchPublicationNamesFromCountry(newValue!);
    }
  },
  {
    immediate: true,
  },
);

watch(
  () => currentIssue.value.publicationcode,
  async (newValue, oldValue) => {
    debugger;
    if (newValue) {
      if (oldValue !== newValue && oldValue !== undefined) {
        currentIssue.value.issuenumber = undefined;
      }
      await fetchIssuecodesByPublicationcode([newValue]);
      const publicationIssues = issuecodesByPublicationcode.value[newValue];
      await fetchIssuecodeDetails(publicationIssues);
      issues.value = issuecodesByPublicationcode.value[
        currentIssue.value.publicationcode!
      ].map((issuecode) => ({
        issuecode,
        issuenumber: issuecodeDetails.value[issuecode]!.issuenumber,
      }));
    }
  },
  {
    immediate: true,
  },
);

(async () => {
  await fetchCountryNames();
})();
</script>
<style scoped lang="scss">
:deep(select + div) {
  overflow-x: hidden;
  overflow-y: auto;
  padding: 3px;
  margin-bottom: 10px;
}
:deep(.user-control-input[type="checkbox"]) {
  position: static;
  width: 2rem;
}
.invalid-feedback {
  color: red;
  text-align: left;
}
</style>
