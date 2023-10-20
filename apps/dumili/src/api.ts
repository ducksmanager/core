import axios from "axios";
import { buildWebStorage } from "axios-cache-interceptor";
import Cookies from "js-cookie";

import {
  addTokenRequestInterceptor,
  addUrlParamsRequestInterceptor,
} from "~axios-helper";
import { createCachedCoaApi } from "~web";

const cachedCoaApi = createCachedCoaApi(
  buildWebStorage(sessionStorage),
  import.meta.env.VITE_GATEWAY_URL
);

const defaultApi = addTokenRequestInterceptor(
  addUrlParamsRequestInterceptor(
    axios.create({ baseURL: import.meta.env.VITE_DM_API_URL })
  ),
  () => Promise.resolve(Cookies.get("token") as string)
);

export { cachedCoaApi, defaultApi };
