import { defineStore } from 'pinia'

export const hoveredStep = defineStore('hoveredStep', {
  state: () => ({
    issuenumber: null,
    stepNumber: null,
  }),
})
