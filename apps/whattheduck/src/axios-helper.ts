import { Preferences } from '@capacitor/preferences';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import type { AxiosCacheInstance } from 'axios-cache-interceptor';

import type { Call, ContractWithMethodAndUrl } from '~types/Call';

axios.defaults.baseURL = import.meta.env.VITE_DM_API_URL;

axios.interceptors.request.use(
  async (config) => {
    const token: string | null = (await Preferences.get({ key: 'token' }))?.value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const addUrlParamsRequestInterceptor = <Type extends AxiosInstance | AxiosCacheInstance>(
  axiosInstance: Type
): Type => {
  axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.url) {
      const currentUrl = new URL(config.url, config.baseURL);
      currentUrl.pathname = Object.entries(config.urlParams ?? ({} as Record<string, string>)).reduce(
        (pathname, [k, v]) => pathname.replace(`:${k}`, encodeURIComponent(v)),
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
};

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }

  interface AxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }
}

type MyCall = Call<unknown>;

export const call = <Contract extends ContractWithMethodAndUrl<MyCall>>(
  instance: AxiosInstance | AxiosCacheInstance,
  contract: Contract
): Promise<AxiosResponse<Contract['resBody']>> =>
  instance.request<Contract['resBody']>({
    method: contract.getMethod(),
    url: contract.getUrl(),
    params: contract.call?.query || undefined,
    urlParams: contract.call?.params ?? undefined,
    data: (contract.call?.reqBody as never) || undefined,
  });

export const getChunkedRequests = async <Contract extends ContractWithMethodAndUrl<MyCall>>({
  callFn,
  valuesToChunk,
  chunkSize,
}: {
  callFn: (chunk: string) => Promise<AxiosResponse<Contract['resBody']>>;
  valuesToChunk: string[];
  chunkSize: number;
  chunkOnQueryParam?: boolean;
  parameterName?: string;
}): Promise<Contract['resBody']> => {
  const slices = Array.from({ length: Math.ceil(valuesToChunk.length / chunkSize) }, (_, i) =>
    valuesToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
  );
  let acc: Contract['resBody'] = (await callFn(slices[0].join(','))).data;
  for (const slice of slices.slice(1)) {
    acc = Array.isArray(acc)
      ? [...(acc as never[]), ...((await callFn(slice.join(','))).data as never[])]
      : {
          ...(acc as Record<string, never>),
          ...((await callFn(slice.join(','))).data as Record<string, never>),
        };
  }
  return acc;
};

export const createAxios = (baseURL: string): AxiosInstance => {
  const newInstance = axios.create({ baseURL });
  addUrlParamsRequestInterceptor(newInstance);

  return newInstance;
};
