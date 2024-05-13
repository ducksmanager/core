import { defineStore } from "pinia";

export const ui = defineStore("ui", () => ({
  zoom: ref<number>(1.5),
  showIssueNumbers: ref<boolean>(true),
  showEdgeOverflow: ref<boolean>(true),
  showPreviousEdge: ref<boolean | undefined>(true),
  showNextEdge: ref<boolean | undefined>(true),
  showEdgePhotos: ref<boolean | undefined>(true),
  colorPickerOption: ref<string | null>(null),
  positionInCanvas: ref<[number, number] | null>(null),
}));
