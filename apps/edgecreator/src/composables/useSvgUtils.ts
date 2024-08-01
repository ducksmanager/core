import axios from "axios";
import { DOMParser } from "xmldom";

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
    publicationcode: string,
    issuenumber: string,
    mtime: string,
    publishedVersion = false,
  ) => {
    const edgeUrl = getEdgeUrl(
      publicationcode,
      issuenumber,
      `svg?${mtime}`,
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
    publicationcode: string,
    issuenumber: string,
    extension: string,
    publishedVersion: boolean,
  ) =>
    `${import.meta.env.VITE_EDGES_URL as string}/${publicationcode.split("/")[0]}/gen/${
      publishedVersion ? "" : "_"
    }${publicationcode.split("/")[1]}.${issuenumber}.${extension}`;

  return {
    getSvgMetadata,
    loadSvgFromString,
    getEdgeUrl,
  };
};
