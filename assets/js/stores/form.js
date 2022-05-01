import { defineStore } from "pinia";

export const form = defineStore('form', {
  state: () => ({
    errors: {}
  }),

  actions: {
    addErrors(errors) {
      this.errors = {...this.errors, ...errors}
    },
    clearErrors() {
      this.errors = {}
    }
  },
})