import { AxiosInstance, AxiosRequestConfig } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";

export function addUrlParamsRequestInterceptor<
  Type extends AxiosInstance | AxiosCacheInstance
>(axiosInstance: Type) {
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (config.url) {
      const currentUrl = new URL(config.url, config.baseURL);
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
