import { api } from "~/stores/api";
import { ModelContributor } from "~types/ModelContributor";
import { POST__fs__save } from "~types/routes";

import { call } from "../../axios-helper";

export default () => {
  const removeVueMarkup = (element: HTMLElement) => {
    Object.values(element.attributes || {})
      .filter((attribute) => attribute.name.startsWith("data-v-"))
      .forEach(({ name: attributeName }) =>
        element.removeAttribute(attributeName)
      );
    for (const childNode of Object.values(element.childNodes)) {
      removeVueMarkup(childNode as HTMLElement);
    }
    return element;
  };
  const saveEdgeSvg = async (
    country: string,
    magazine: string,
    issuenumber: string,
    contributors: ModelContributor[],
    withExport = false,
    withSubmit = false
  ) => {
    const svgElementId = `edge-canvas-${issuenumber}`;
    const cleanSvg = removeVueMarkup(
      document.getElementById(svgElementId)!.cloneNode(true) as HTMLElement
    );
    if (!cleanSvg) {
      return Promise.reject(
        new Error(`Couldn't save SVG : empty content for ID ${svgElementId}`)
      );
    }
    return (
      await call(
        api().edgeCreatorApi,
        new POST__fs__save({
          reqBody: {
            runExport: withExport,
            runSubmit: withSubmit,
            country,
            magazine,
            issuenumber,
            contributors,
            content: cleanSvg.outerHTML,
          },
        })
      )
    ).data;
  };

  return {
    removeVueMarkup,
    saveEdgeSvg,
  };
};
