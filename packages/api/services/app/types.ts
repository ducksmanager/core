export type AppInfos = {
  // version_name: string;
  // version_build: string;
  // version_os: string;
  // custom_id?: string;
  // is_prod?: boolean;
  // is_emulator?: boolean;
  // plugin_version: string;
  // platform: string;
  // app_id: string;
  // device_id: string;
};

type AppUpdate = {
  version: string;
  url: string;
};

export const namespaceEndpoint = "/app";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getUpdate: (
    data: AppInfos,
    callback: (value: AppUpdate) => void,
  ) => void;
}
