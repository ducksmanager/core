interface AppInfos {
  version_name: string;
  version_build: string;
  version_os: string;
  custom_id?: string;
  is_prod?: boolean;
  is_emulator?: boolean;
  plugin_version: string;
  platform: string;
  app_id: string;
  device_id: string;
}

export const getAppUpdates = (requestBody: string) => {
  const body = JSON.parse(requestBody || "{}") as AppInfos;
  console.log("update asked", body);

  if (body.version_name === "1.0.0") {
    return {
      version: "1.0.1",
      url: "https://apiurl.com/mybuild_101.zip",
    };
  } else {
    return {
      message: "Error version not found",
      version: "",
      url: "",
    };
  }
};
