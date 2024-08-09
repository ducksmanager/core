import { defineStore } from "pinia";

import { step } from "~/stores/step";

export const editingStep = defineStore("editingStep", () => {
  const issuecodes = ref<string[]>([]),
    stepNumber = ref(0),
    editingOptions = computed(() =>
      step().getFilteredOptions({
        stepNumbers: [stepNumber.value],
        issuecodes: issuecodes.value,
      }),
    ),
    dimensions = computed(() =>
      step().getFilteredDimensions({
        issuecodes: issuecodes.value,
      }),
    ),
    addIssuecode = (issuecode: string) => {
      issuecodes.value = issuecodes.value.concat(issuecode).sort();
    },
    addIssuecodes = (newIssuecodes: string[]) => {
      issuecodes.value = [
        ...new Set([...issuecodes.value, ...newIssuecodes]),
      ].sort();
    },
    replaceIssuecode = (issuecode: string) => {
      issuecodes.value = [issuecode];
    },
    toggleIssuecode = (issuecode: string) => {
      if (issuecodes.value.includes(issuecode)) {
        if (issuecodes.value.length > 1) {
          issuecodes.value.splice(issuecodes.value.indexOf(issuecode), 1);
        }
      } else {
        issuecodes.value = [
          ...new Set(issuecodes.value.concat(issuecode)),
        ].sort();
      }
    };

  return {
    dimensions,
    issuecodes,
    stepNumber,
    editingOptions,
    addIssuecode,
    addIssuecodes,
    replaceIssuecode,
    toggleIssuecode,
  };
});
