import { main } from "~/stores/main";
import { ui } from "~/stores/ui";

const uiStore = ui();
const mainStore = main();

export default () => {
  const showPreviousEdge = computed({
    get: (): boolean | undefined =>
      (uiStore.showPreviousEdge && mainStore.edgesBefore.length > 0) ||
      undefined,
    set: (value: boolean | undefined): void =>
      uiStore.$patch({ showPreviousEdge: value }),
  });
  const showNextEdge = computed({
    get: (): boolean | undefined =>
      (uiStore.showNextEdge === true && mainStore.edgesAfter.length > 0) ||
      undefined,
    set: (value: boolean | undefined): void =>
      uiStore.$patch({ showNextEdge: value }),
  });
  return {
    showPreviousEdge,
    showNextEdge,
  };
};
