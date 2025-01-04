import type { Errorable, ScopedError } from '~socket.io-services';

export default (fields: string[]) => {
  const errorTexts = ref<Record<string, string>>({});
  const validInputs = computed(() => fields.filter((field) => !invalidInputs.value.includes(field)));
  const invalidInputs = computed(() => Object.keys(errorTexts.value));
  const touchedInputs = ref<string[]>([]);

  const clearErrors = () => (errorTexts.value = {});

  const showError = (scopedError: ScopedError) => {
    errorTexts.value[scopedError.selector] = scopedError.message;
  };

  const handleErrorIfExists = (response: Errorable<string, string>) => {
    if (typeof response === 'object' && 'error' in response) {
      if ('selector' in response && response.selector) {
        errorTexts.value[response.selector!.replace('#', '')] = response.message;
      } else {
        errorTexts.value[fields[0]] = response.errorDetails || response.error;
        console.error(response);
      }
      return true;
    } else {
      return false;
    }
  };

  const submit = async (fn: () => Promise<Errorable<string, string>>, onSuccess: (response: string) => void) =>
    fn()
      .then((response) => {
        if (!handleErrorIfExists(response)) {
          onSuccess(response as string);
        }
      })
      .catch((e) => {
        handleErrorIfExists(e);
      });

  return { validInputs, invalidInputs, touchedInputs, errorTexts, showError, clearErrors, submit };
};
