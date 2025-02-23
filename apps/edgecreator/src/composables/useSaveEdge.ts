import type { ModelContributor } from "~types/ModelContributor";

import { edgecreatorSocketInjectionKey } from "./useEdgecreatorSocket";

export default () => {
  const { save: saveEvents } = injectLocal(edgecreatorSocketInjectionKey)!;

  const removeVueMarkup = (element: HTMLElement) => {
    Object.values(element.attributes || [])
      .filter((attribute) => attribute.name.startsWith("data-v-"))
      .forEach(({ name: attributeName }) =>
        element.removeAttribute(attributeName),
      );
    for (const childNode of Object.values(element.childNodes)) {
      removeVueMarkup(childNode as HTMLElement);
    }
    return element;
  };
  const saveEdgeSvg = async (
    issuecode: string,
    contributors: ModelContributor[],
    withExport = false,
    withSubmit = false,
  ) => {
    const svgElementId = `edge-canvas-${issuecode}`;
    const cleanSvg = removeVueMarkup(
      document.getElementById(svgElementId)!.cloneNode(true) as HTMLElement,
    );
    return saveEvents
      .saveEdge({
        runExport: withExport,
        runSubmit: withSubmit,
        issuecode,
        contributors,
        content: cleanSvg.outerHTML,
      })
      .then(({ results }) => results);
  };

  return {
    removeVueMarkup,
    saveEdgeSvg,
  };
};
