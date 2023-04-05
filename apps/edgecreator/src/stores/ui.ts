import { defineStore } from "pinia";

export const ui = defineStore("ui", () => ({
  zoom: ref(1.5 as number),
  showIssueNumbers: ref(true as boolean),
  showEdgeOverflow: ref(true as boolean),
  showPreviousEdge: ref(true as boolean | undefined),
  showNextEdge: ref(true as boolean | undefined),
  showEdgePhotos: ref(true as boolean | undefined),
  colorPickerOption: ref(null as string | null),
  positionInCanvas: ref(null as [number, number] | null),
}));
