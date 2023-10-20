import {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

export type Call<
  ResBody,
  Params = Record<string, string> | undefined,
  ReqBody = unknown,
  Query = unknown
> = {
  resBody?: ResBody;
  params?: Params;
  reqBody?: ReqBody;
  query?: Query;
};

export type CallWithoutResBody<
  Params = Record<string, string> | undefined,
  ReqBody = unknown,
  Query = unknown
> = {
  params?: Params;
  reqBody?: ReqBody;
  query?: Query;
};

export abstract class ContractWithMethodAndUrl<T extends Call<unknown>> {
  constructor(t?: Omit<T, "resBody">) {
    if (t) {
      this.call = { params: t.params, query: t.query, reqBody: t.reqBody };
    }
  }
  public getMethod = (): string =>
    (this.constructor as typeof ContractWithMethodAndUrl).method;
  public getUrl = (): string =>
    (this.constructor as typeof ContractWithMethodAndUrl).url;

  static readonly method: "get" | "post" | "put" | "delete";
  static readonly url: string;
  call?: CallWithoutResBody;

  resBody!: T["resBody"];
}

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
  getTokenFn: () => Promise<string>
): Type => {
  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getTokenFn();
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
