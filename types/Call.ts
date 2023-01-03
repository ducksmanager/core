import { AxiosResponse } from "axios";

export type Call<
  ResBody = undefined,
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
  T extends Call<
    object | undefined,
    object | undefined,
    object | undefined,
    object | undefined
  >
> = {
  urlParams?: T["params"];
  params?: T["reqQuery"];
  data?: T["reqBody"];
};

export type AxiosTypedResponse<
  T extends Call<
    object | undefined,
    object | undefined,
    object | undefined,
    object | undefined
  >
> = Promise<AxiosResponse<T["resBody"]>>;

export type AxiosTypedRequestBody<
  T extends Call<
    object | undefined,
    object | undefined,
    object | undefined,
    object | undefined
  >
> = T["reqBody"];
