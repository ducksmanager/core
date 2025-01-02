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
      v-model="currentPublicationcode"
      :options="publicationNamesForCurrentCountry"
      @change="emit('change')"
    />
    <template v-if="currentCountrycode && currentPublicationcode">
      <b-form-input
        v-model="currentIssuenumber"
        :placeholder="$t('Entrez le numéro')"
        :state="isValid"
      />
      <div class="invalid-feedback">
        <template v-if="['', undefined].includes(currentIssuenumber)">{{
          $t("Veuillez entrer le numéro")
        }}</template
        ><template v-else>{{ $t("Ce numéro est déjà référencé !") }}</template>
      </div>
    </template>
    <b-button
      v-if="currentIssuenumber !== undefined"
      variant="success"
      :disabled="!isValid"
      @click="
        emit('change', {
          publicationcode: currentPublicationcode!,
          issuenumber: currentIssuenumber,
          issuecode: `${currentPublicationcode} ${currentIssuenumber}`,
        })
      "
      >OK</b-button
    >
  </div>
</template>
<script setup lang="ts">
const { t: $t } = useI18n();

const emit = defineEmits<
  (
    e: "change",
    data?: {
      publicationcode: string;
      issuenumber: string;
      issuecode: string;
    },
  ) => void
>();

const currentCountrycode = ref<string>();
const currentPublicationcode = ref<string>();
const currentIssuenumber = ref<string>();

const {
  countryNames: coaCountryNames,
  publicationNames,
  issuecodeDetails,
  issuecodesByPublicationcode,
} = storeToRefs(coa());
const {
  fetchPublicationNamesFromCountry,
  fetchIssuecodesByPublicationcode,
  fetchCountryNames,
} = coa();

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
  coa().publicationNamesFullCountries.includes(currentCountrycode.value || "")
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
const publicationIssues = computed(
  () => issuecodesByPublicationcode.value[currentPublicationcode.value!],
);

const issues = computed(
  () =>
    publicationIssues.value &&
    issuecodesByPublicationcode.value[currentPublicationcode.value!].map(
      (issuecode) => ({
        value: issuecode,
        text: issuecodeDetails.value[issuecode]!.issuenumber,
      }),
    ),
);

const isValid = computed(
  () =>
    !!currentIssuenumber.value &&
    !issues.value?.some(({ value }) => value === currentIssuenumber.value),
);

watch(
  currentCountrycode,
  async (newValue) => {
    if (newValue) {
      currentPublicationcode.value = undefined;
      currentIssuenumber.value = undefined;

      await fetchPublicationNamesFromCountry(newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(currentPublicationcode, async (newValue) => {
  if (newValue) {
    currentIssuenumber.value = undefined;
    await fetchIssuecodesByPublicationcode([newValue]);
  }
});

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
