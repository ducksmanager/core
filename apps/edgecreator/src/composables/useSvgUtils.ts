import axios from "axios";

import { coa } from "~web/src/stores/coa";

export default () => {
  const getSvgMetadata = (svgChildNodes: SVGElement[], metadataType: string) =>
    svgChildNodes
      .filter(
        (node) =>
          node.nodeName === "metadata" &&
          node.attributes.getNamedItem("type")!.nodeValue === metadataType,
      )
      .map((metadataNode) => metadataNode.textContent!.trim());

  const loadSvgFromString = async (
    issuecode: string,
    publishedVersion = false,
  ) => {
    await coa().fetchIssuecodeDetails([issuecode]);
    const edgeUrl = getEdgeUrl(
      issuecode,
      `svg?${new Date().toISOString()}`,
      publishedVersion,
    );

    const svgString = (await axios.get(edgeUrl)).data as string;
    if (!svgString) {
      throw new Error(`No SVG found : ${edgeUrl}`);
    }
    const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
    const svgElement = doc.getElementsByTagName("svg")[0];
    const svgChildNodes = Object.values(svgElement.childNodes) as SVGElement[];

    return { svgElement, svgChildNodes };
  };
  const getEdgeUrl = (
    issuecode: string,
    extension: string,
    publishedVersion: boolean,
  ) => {
    const { publicationcode, issuenumber } = coa().issuecodeDetails[issuecode];
    const [countrycode, magazinecode] = publicationcode.split("/");
    return `${import.meta.env.VITE_EDGES_URL as string}/${countrycode}/gen/${publishedVersion ? "" : "_"}${magazinecode}.${issuenumber}.${extension}`;
  };

  return {
    getSvgMetadata,
    loadSvgFromString,
    getEdgeUrl,
  };
};
