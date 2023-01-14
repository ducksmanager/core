import { AxiosResponse } from "axios";

export type Call<
  ResBody,
  P = undefined,
  ReqBody = undefined,
  ReqQuery = undefined
> = {
  resBody: ResBody;
  params: P;
  reqBody: ReqBody;
  reqQuery: ReqQuery;
};

export type AxiosTypedRequestConfig<
  T extends Call<unknown, unknown, unknown, unknown>
> = {
  urlParams?: T["params"];
  params?: T["reqQuery"];
  data?: T["reqBody"];
};

export type AxiosTypedResponse<
  T extends Call<unknown, unknown, unknown, unknown>
> = Promise<AxiosResponse<T["resBody"]>>;

export type AxiosTypedRequestBody<
  T extends Call<unknown, unknown, unknown, unknown>
> = T["reqBody"];
