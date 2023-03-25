import { defineStore } from "pinia";

export const editingStep = defineStore("editingStep", {
  state: () => ({
    issuenumbers: [] as string[],
    stepNumber: 0 as number,
  }),

  actions: {
    addIssuenumber(issuenumber: string) {
      this.issuenumbers = [
        ...new Set(this.issuenumbers.concat(issuenumber)),
      ].sort();
    },
    addIssuenumbers(issuenumbers: string[]) {
      this.issuenumbers = [
        ...new Set([...this.issuenumbers, ...issuenumbers]),
      ].sort();
    },
    replaceIssuenumber(issuenumber: string) {
      this.issuenumbers = [issuenumber];
    },
    toggleIssuenumber(issuenumber: string) {
      if (this.issuenumbers.includes(issuenumber)) {
        if (this.issuenumbers.length > 1) {
          this.issuenumbers.splice(this.issuenumbers.indexOf(issuenumber), 1);
        }
      } else {
        this.issuenumbers = [
          ...new Set(this.issuenumbers.concat(issuenumber)),
        ].sort();
      }
    },
  },
});
