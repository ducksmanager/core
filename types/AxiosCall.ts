import { AxiosResponse } from "axios";

import type { Call } from "./Call";

export type AxiosTypedResponse<
  T extends Call<unknown, unknown, unknown, unknown>
> = Promise<AxiosResponse<T["resBody"]>>;
