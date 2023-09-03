import {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { Call, ContractWithMethodAndUrl } from "../../types/Call"; // Don't use an alias here or it will break when using DM as a Node dependency

type MyCall = Call<
  unknown,
  Record<string, string> | undefined,
  unknown | undefined,
  unknown | undefined
>;

declare module "axios" {
  interface InternalAxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }

  interface AxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }
}

export const addTokenRequestInterceptor = <Type extends AxiosInstance>(
  axiosInstance: Type,
  getTokenFn: () => string
): Type => {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = getTokenFn();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
  );
  return axiosInstance;
};

export const addUrlParamsRequestInterceptor = <Type extends AxiosInstance>(
  axiosInstance: Type
) => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.url) {
        const currentUrl = new URL(config.url, config.baseURL);
        currentUrl.pathname = Object.entries(
          config.urlParams || ({} as Record<string, string>)
        ).reduce(
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

export const call = <Contract extends ContractWithMethodAndUrl<MyCall>>(
  instance: AxiosInstance,
  contract: Contract
): Promise<AxiosResponse<Contract["resBody"]>> =>
  instance.request<Contract["resBody"]>({
    method: contract.getMethod(),
    url: contract.getUrl(),
    params: contract.call?.query || undefined,
    urlParams: (contract.call?.params as never) || undefined,
    data: (contract.call?.reqBody as never) || undefined,
  });

export const getChunkedRequests = async <
  Contract extends ContractWithMethodAndUrl<MyCall>
>({
  callFn,
  valuesToChunk,
  chunkSize,
}: {
  callFn: (chunk: string) => Promise<AxiosResponse<Contract["resBody"]>>;
  valuesToChunk: string[];
  chunkSize: number;
  chunkOnQueryParam?: boolean;
  parameterName?: string;
}): Promise<Contract["resBody"]> => {
  const slices = Array.from(
    { length: Math.ceil(valuesToChunk.length / chunkSize) },
    (_, i) => valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
  let acc: Contract["resBody"] = (await callFn(slices[0].join(","))).data;
  for (const slice of slices.slice(1)) {
    acc = Array.isArray(acc)
      ? [
          ...(acc as never[]),
          ...((await callFn(slice.join(","))).data as never[]),
        ]
      : {
          ...(acc as { [key: string]: never }),
          ...((await callFn(slice.join(","))).data as {
            [key: string]: never;
          }),
        };
  }
  return acc;
};
