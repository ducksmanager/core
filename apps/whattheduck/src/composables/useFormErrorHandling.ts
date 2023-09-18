import type { AxiosError } from 'axios';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ScopedError } from '~dm-types/ScopedError';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (fields: string[]) => {
  const { t } = useI18n();
  const errorTexts = ref({} as Record<string, string>);
  const validInputs = computed(() => fields.filter((field) => !invalidInputs.value.includes(field)));
  const invalidInputs = computed(() => Object.keys(errorTexts.value));
  const touchedInputs = ref([] as string[]);

  const clearErrors = () => (errorTexts.value = {});

  const showError = (e: AxiosError) => {
    const scopedError = (e.response?.data as ScopedError) || {
      message: t('error'),
    };
    errorTexts.value[scopedError.selector] = scopedError.message;
  };

  return { validInputs, invalidInputs, touchedInputs, errorTexts, showError, clearErrors };
};
