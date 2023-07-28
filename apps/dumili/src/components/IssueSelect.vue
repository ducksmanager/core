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
const countryNames = computed(() => coaStore.countryNames);
const publications = computed(
  () =>
    coaStore.publicationNames &&
    Object.keys(coaStore.publicationNames)
      .filter((publicationCode) =>
        publicationCode.startsWith(`${currentCountryCode.value!}/`)
      )
      .map((publicationCode) => ({
        text: coaStore.publicationNames[publicationCode],
        value: publicationCode,
      }))
      .filter(({ text }) => text !== null)
      .sort(({ text: text1 }, { text: text2 }) =>
        text1! < text2! ? -1 : text2! < text1! ? 1 : 0
      )
);

const publicationIssues = computed(
  () => coaStore.issueNumbers[currentPublicationCode.value!]
);

const issues = computed(
  () =>
    publicationIssues.value &&
    coaStore.issueNumbers[currentPublicationCode.value!].map((issuenumber) => {
      return {
        value: issuenumber,
        text: issuenumber,
      };
    })
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
:deep(.custom-control-input[type="checkbox"]) {
  position: static;
  width: 2rem;
}
.invalid-feedback {
  color: red;
  text-align: left;
}
</style>
