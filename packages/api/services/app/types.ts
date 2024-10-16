import type { Errorable } from "~socket.io-services/types";

export type AppInfos = {
  version: string;
};

export type ErrorableAppUpdate = Errorable<
  AppUpdate,
  "Not found" | "Already up to date"
>;

export type AppUpdate = {
  version: string;
  url: string;
};

export const namespaceEndpoint = "/app";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getBundleUrl: (
    data: AppInfos,
    callback: (value: ErrorableAppUpdate) => void,
  ) => void;
}
