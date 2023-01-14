import { AxiosResponse } from "axios";

import type { Call } from "./Call";

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
