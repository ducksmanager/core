import { AxiosInstance, AxiosResponse } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";

export type TypedConfig<MyCall extends Call<unknown>> = {
  urlParams?: MyCall["params"];
  data?: MyCall["reqBody"];
  params?: MyCall["query"];
};

export type Call<
  ResBody,
  Params = Record<string, string> | undefined,
  ReqBody = unknown,
  Query = unknown
> = {
  resBody: ResBody;
  params?: Params;
  reqBody: ReqBody;
  query: Query;
};

export const call = <MyCall extends Call<unknown>>(
  method: string,
  url: string,
  instance: AxiosInstance | AxiosCacheInstance,
  config?: TypedConfig<MyCall>
): Promise<AxiosResponse<MyCall["resBody"]>> =>
  instance.request<MyCall["resBody"]>({
    method,
    url,
    urlParams: config?.urlParams,
    params: config?.params,
    data: config?.data as never,
  });
