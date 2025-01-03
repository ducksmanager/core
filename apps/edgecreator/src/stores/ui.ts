import { defineStore } from "pinia";

export const ui = defineStore("ui", () => ({
  zoom: ref<number>(1.5),
  showIssueNumbers: ref(true),
  showEdgeOverflow: ref(true),
  showPreviousEdge: ref<boolean | undefined>(true),
  showNextEdge: ref<boolean | undefined>(true),
  showEdgePhotos: ref<boolean | undefined>(true),
  colorPickerOption: ref<string>(),
  positionInCanvas: ref<[number, number]>(),
}));
