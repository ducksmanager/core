// noinspection ES6PreferShortImport

import { ContractWithMethodAndUrl } from "./Call";
import type { ExportPaths } from "./ExportPaths";
import type { ModelContributor } from "./ModelContributor";

export class GET__fs__base64 extends ContractWithMethodAndUrl<{
  resBody: {
    dimensions: { width: number; height: number };
    base64: string;
    url: string;
  };
  query: { targetUrl: string };
}> {
  static readonly method = "get";
  static readonly url = "/fs/base64";
}
export class GET__fs__browseEdges extends ContractWithMethodAndUrl<{
  resBody: {
    current: { filename: string; mtime: string }[];
    published: { filename: string; mtime: string }[];
  };
}> {
  static readonly method = "get";
  static readonly url = "/fs/browseEdges";
}
export class GET__fs__generateDefaultEdge extends ContractWithMethodAndUrl<{
  resBody: {
    current: string[];
    published: string[];
  };
}> {
  static readonly method = "get";
  static readonly url = "/fs/generateDefaultEdge";
}
export class POST__fs__save extends ContractWithMethodAndUrl<{
  resBody: { paths: ExportPaths; isNew: boolean };
  reqBody: {
    runExport: boolean;
    runSubmit: boolean;
    country: string;
    magazine: string;
    issuenumber: string;
    contributors: ModelContributor[];
    content: string;
  };
}> {
  static readonly method = "post";
  static readonly url = "/fs/save";
}
export class GET__fs__text extends ContractWithMethodAndUrl<{
  resBody:
    | {
        width: number;
        height: number;
        url: string;
      }
    | { error: string };
  query: {
    color: string;
    colorBackground: string;
    width: number;
    font: string;
    text: string;
  };
}> {
  static readonly method = "get";
  static readonly url = "/fs/text";
}
export class POST__fs__upload_base64 extends ContractWithMethodAndUrl<{
  resBody: { fileName: string };
  reqBody: {
    data: string;
    country: string;
    magazine: string;
    issuenumber: string;
  };
}> {
  static readonly method = "post";
  static readonly url = "/fs/upload-base64";
}
export class POST__fs__upload extends ContractWithMethodAndUrl<{
  resBody: { fileName: string }[];
  reqBody: {
    photo: boolean;
    multiple: boolean;
    edge: {
      country: string;
      magazine: string;
      issuenumber: string;
    };
  };
}> {
  static readonly method = "post";
  static readonly url = "/fs/upload";
}
export class GET__fs__browse__$imageType__$country__$magazine extends ContractWithMethodAndUrl<{
  params: {
    imageType: "elements" | "photos";
    country: string;
    magazine: string;
  };
  resBody: string[];
}> {
  static readonly method = "get";
  static readonly url = "/fs/browse/:imageType/:country/:magazine";
}
