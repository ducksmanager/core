import { defineStore } from "pinia";

import { globalEvent } from "~/stores/globalEvent";

export const editingStep = defineStore("editingStep", () => {
  const issuenumbers = ref([] as string[]),
    stepNumber = ref(0 as number),
    editingOptions = computed(() =>
      globalEvent().getFilteredOptions({
        stepNumbers: [stepNumber.value],
        issuenumbers: issuenumbers.value,
      })
    ),
    addIssuenumber = (issuenumber: string) => {
      issuenumbers.value = [
        ...new Set(issuenumbers.value.concat(issuenumber)),
      ].sort();
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
    issuenumbers,
    stepNumber,
    editingOptions,
    addIssuenumber,
    addIssuenumbers,
    replaceIssuenumber,
    toggleIssuenumber,
  };
});
