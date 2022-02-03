import { defineStore } from 'pinia'

export const editingStep = defineStore('editingStep', {
  state: () => ({
    issuenumbers: [],
    stepNumber: 0,
  }),

  actions: {
    addIssuenumber(issuenumber) {
      this.issuenumbers = [
        ...new Set(this.issuenumbers.concat(issuenumber)),
      ].sort()
    },
    addIssuenumbers(issuenumbers) {
      this.issuenumbers = [
        ...new Set([...this.issuenumbers, ...issuenumbers]),
      ].sort()
    },
    replaceIssuenumber(issuenumber) {
      this.issuenumbers = [issuenumber]
    },
    toggleIssuenumber(issuenumber) {
      if (this.issuenumbers.includes(issuenumber)) {
        if (this.issuenumbers.length > 1) {
          this.issuenumbers.splice(this.issuenumbers.indexOf(issuenumber), 1)
        }
      } else {
        this.issuenumbers = [
          ...new Set(this.issuenumbers.concat(issuenumber)),
        ].sort()
      }
    },
  },
})
