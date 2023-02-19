import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";

export const addUrlParamsRequestInterceptor = <
  Type extends AxiosInstance | AxiosCacheInstance
>(
  axiosInstance: Type
) => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
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
    }
  );
  return axiosInstance;
};

declare module "axios" {
  interface InternalAxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }
}

declare module "axios" {
  interface AxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }
}
