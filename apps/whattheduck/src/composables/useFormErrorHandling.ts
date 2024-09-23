import type { ScopedError } from '~socket.io-services/types';

export default (fields: string[]) => {
  const errorTexts = ref<Record<string, string>>({});
  const validInputs = computed(() => fields.filter((field) => !invalidInputs.value.includes(field)));
  const invalidInputs = computed(() => Object.keys(errorTexts.value));
  const touchedInputs = ref<string[]>([]);

  const clearErrors = () => (errorTexts.value = {});

  const showError = (scopedError: ScopedError) => {
    errorTexts.value[scopedError.selector] = scopedError.message;
  };

  return { validInputs, invalidInputs, touchedInputs, errorTexts, showError, clearErrors };
};
