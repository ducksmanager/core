import { defineStore } from "pinia";

export const form = defineStore('form', {
  state: () => ({
    errors: {}
  }),

  getters: {
    hasErrors: ({ errors }) => Object.keys(errors).length
  },

  actions: {
    addErrors(errors) {
      this.errors = {...this.errors, ...errors}
    },
    clearErrors() {
      this.errors = {}
    }
  },
})