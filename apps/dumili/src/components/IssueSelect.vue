<template>
  <div v-if="countryNames">
    <b-form-select
      v-model="currentCountryCode"
      :options="countryNames"
      @change="emit('change', null)"
    >
      <template #first>
        <b-form-select-option :value="undefined" disabled>{{
          $t("Sélectionnez un pays")
        }}</b-form-select-option>
      </template>
    </b-form-select>
    <b-form-select
      v-show="currentCountryCode"
      v-model="currentPublicationCode"
      :options="publicationNamesForCurrentCountry"
      @change="emit('change', null)"
    />
    <template v-if="currentCountryCode && currentPublicationCode">
      <b-form-input
        v-model="currentIssueNumber"
        placeholder="Entrez le numéro"
        :state="isValid"
      />
      <div class="invalid-feedback">
        <template v-if="currentIssueNumber === ''"
          >Veuillez entrer le numéro</template
        ><template v-else> Ce numéro est déjà référencé !</template>
      </div>
    </template>
    <b-button
      v-if="currentIssueNumber !== undefined"
      variant="success"
      :disabled="!isValid"
      @click="emit('change', issuecode)"
      >OK</b-button
    >
    <slot v-if="$slots.dimensions && currentIssueNumber !== null" />
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";

const { t: $t } = useI18n();

const coaStore = coa();

const emit = defineEmits<(e: "change", issuecode: string | null) => void>();

const props = withDefaults(
  defineProps<{
    countryCode?: string | null;
    publicationCode?: string | null;
    issueCode?: string | null;
  }>(),
  {
    countryCode: undefined,
    publicationCode: undefined,
    issueCode: undefined,
  }
);

const currentCountryCode = ref(undefined as string | undefined);
const currentPublicationCode = ref(undefined as string | undefined);
const currentIssueNumber = ref(undefined as string | undefined);

const issuecode = computed(() => {
  if (
    currentCountryCode.value &&
    currentPublicationCode.value &&
    currentIssueNumber.value
  ) {
    return `${currentPublicationCode.value} ${currentIssueNumber.value}`;
  }
  return null;
});
const countryNames = computed(
  () =>
    (coaStore.countryNames &&
      Object.entries(coaStore.countryNames)
        .map(([countrycode, countryName]) => ({
          text: countryName,
          value: countrycode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2)
        )) ||
    undefined
);

const publicationNamesForCurrentCountry = computed(() =>
  coaStore.publicationNamesFullCountries.includes(
    currentCountryCode.value || ""
  )
    ? Object.keys(coaStore.publicationNames)
        .filter(
          (publicationcode) =>
            publicationcode.indexOf(`${currentCountryCode.value}/`) === 0
        )
        .map((publicationcode) => ({
          text: coaStore.publicationNames[publicationcode],
          value: publicationcode,
        }))
        .sort(({ text: text1 }, { text: text2 }) =>
          (text1 || "").localeCompare(text2 || "")
        )
    : []
);
const publicationIssues = computed(
  () => coaStore.issueNumbers[currentPublicationCode.value!]
);

const issues = computed(
  () =>
    publicationIssues.value &&
    coaStore.issueNumbers[currentPublicationCode.value!].map((issuenumber) => ({
      value: issuenumber,
      text: issuenumber,
    }))
);

const isValid = computed(
  () =>
    currentIssueNumber.value &&
    !issues.value?.some(({ value }) => value === currentIssueNumber.value)
);

watch(
  () => currentCountryCode.value,
  async (newValue) => {
    if (newValue) {
      currentPublicationCode.value = props.publicationCode!;
      currentIssueNumber.value = undefined;

      await coaStore.fetchPublicationNamesFromCountry(newValue);
    }
  },
  {
    immediate: true,
  }
);

watch(
  () => currentPublicationCode.value,
  async (newValue) => {
    if (newValue) {
      currentIssueNumber.value = undefined;
      await coaStore.fetchIssueNumbers([newValue]);
    }
  }
);
if (props.countryCode) {
  currentCountryCode.value = props.countryCode;
}

(async () => {
  await coaStore.fetchCountryNames();
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
