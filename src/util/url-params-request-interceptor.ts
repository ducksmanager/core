import { AxiosInstance, AxiosRequestConfig } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";

export function addUrlParamsRequestInterceptor<
  Type extends AxiosInstance | AxiosCacheInstance
>(axiosInstance: Type) {
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    console.log("!");
    if (config.url) {
      const currentUrl = new URL(config.url, config.baseURL);
      console.log(currentUrl);
      console.log(config.urlParams);
      currentUrl.pathname = Object.entries(config.urlParams || {}).reduce(
        (pathname, [k, v]) =>
          pathname.replace(`:${k}`, encodeURIComponent(v as string)),
        currentUrl.pathname
      );
      return {
        ...config,
        baseURL: `${currentUrl.protocol}//${currentUrl.host}`,
        url: currentUrl.pathname,
      };
    }
    return config;
  });
  return axiosInstance;
}
