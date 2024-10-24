import type { ScopedError } from '~socket.io-services';

export default (
  fields: string[],
): {
  validInputs: ComputedRef<string[]>;
  invalidInputs: ComputedRef<string[]>;
  touchedInputs: Ref<string[]>;
  errorTexts: Ref<Record<string, string>>;
  showError: (scopedError: ScopedError) => void;
  clearErrors: () => void;
} => {
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
