import { defineStore } from 'pinia'

export const ui = defineStore('ui', {
  state: () => ({
    zoom: 1.5,
    showIssueNumbers: true,
    showEdgeOverflow: true,
    showPreviousEdge: true,
    showNextEdge: true,
    showEdgePhotos: true,
    colorPickerOption: null,
    positionInCanvas: null,
  }),
})
