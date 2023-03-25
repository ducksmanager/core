import { defineStore } from "pinia";

export const ui = defineStore("ui", {
  state: () => ({
    zoom: 1.5 as number,
    showIssueNumbers: true as boolean,
    showEdgeOverflow: true as boolean,
    showPreviousEdge: true as boolean | undefined,
    showNextEdge: true as boolean | undefined,
    showEdgePhotos: true as boolean | undefined,
    colorPickerOption: null as string | null,
    positionInCanvas: null as [number, number] | null,
  }),
});
