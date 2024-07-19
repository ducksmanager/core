import { defineStore } from "pinia";

import { step } from "~/stores/step";

export const editingStep = defineStore("editingStep", () => {
  const issuenumbers = ref<string[]>([]),
    stepNumber = ref(0),
    editingOptions = computed(() =>
      step().getFilteredOptions({
        stepNumbers: [stepNumber.value],
        issuenumbers: issuenumbers.value,
      }),
    ),
    dimensions = computed(() =>
      step().getFilteredDimensions({
        issuenumbers: issuenumbers.value,
      }),
    ),
    addIssuenumber = (issuenumber: string) => {
      issuenumbers.value = issuenumbers.value.concat(issuenumber).sort();
    },
    addIssuenumbers = (newIssuenumbers: string[]) => {
      issuenumbers.value = [
        ...new Set([...issuenumbers.value, ...newIssuenumbers]),
      ].sort();
    },
    replaceIssuenumber = (issuenumber: string) => {
      issuenumbers.value = [issuenumber];
    },
    toggleIssuenumber = (issuenumber: string) => {
      if (issuenumbers.value.includes(issuenumber)) {
        if (issuenumbers.value.length > 1) {
          issuenumbers.value.splice(issuenumbers.value.indexOf(issuenumber), 1);
        }
      } else {
        issuenumbers.value = [
          ...new Set(issuenumbers.value.concat(issuenumber)),
        ].sort();
      }
    };

  return {
    dimensions,
    issuenumbers,
    stepNumber,
    editingOptions,
    addIssuenumber,
    addIssuenumbers,
    replaceIssuenumber,
    toggleIssuenumber,
  };
});
