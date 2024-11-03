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
        placeholder="Entrez le numéro"
        :state="isValid"
      />
      <div class="invalid-feedback">
        <template v-if="['', undefined].includes(currentIssuenumber)"
          >Veuillez entrer le numéro</template
        ><template v-else> Ce numéro est déjà référencé !</template>
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
    <slot v-if="$slots.dimensions && currentIssuenumber !== null" />
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

const props = withDefaults(
  defineProps<{
    countrycode?: string | null;
    publicationcode?: string | null;
    issuecode?: string | null;
  }>(),
  {
    countrycode: undefined,
    publicationcode: undefined,
    issuecode: undefined,
  },
);

const currentCountrycode = ref<string | undefined>(undefined);
const currentPublicationcode = ref<string | undefined>(undefined);
const currentIssuenumber = ref<string | undefined>(undefined);

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
      currentPublicationcode.value = props.publicationcode!;
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
if (props.countrycode) {
  currentCountrycode.value = props.countrycode;
}

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
