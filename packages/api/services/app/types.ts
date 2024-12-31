import type { Errorable } from "~socket.io-services";

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

export type Events = {
  getBundleUrl: (
    data: AppInfos) => Promise<ErrorableAppUpdate>;
}

const eventsForType: Events|undefined = undefined

export default { namespaceEndpoint: "/app", eventsForType }