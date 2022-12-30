import axios from "axios";
import { buildWebStorage, setupCache } from "axios-cache-interceptor";
import dayjs from "dayjs";

declare module "axios" {
  interface AxiosRequestConfig {
    urlParams?: Record<string, string>;
  }
}

const customStorage = buildWebStorage(sessionStorage);

const now = dayjs();
const inAnHour = dayjs().add(1, "hour");

let coaCacheExpiration = dayjs();
if (now.get("hour") >= 4) {
  coaCacheExpiration = coaCacheExpiration.add(1, "day");
}
coaCacheExpiration = coaCacheExpiration
  .set("hour", 4)
  .set("minute", 0)
  .set("second", 0)
  .set("millisecond", 0);

const commonCacheOptions = {
  etag: false,
  modifiedSince: false,
  interpretHeader: false,
  generateKey: (options: any) => options.url,
  storage: customStorage,
};

const cachedUserApi = setupCache(
  axios.create({
    baseURL: import.meta.env.VITE_GATEWAY_URL,
  }),
  {
    ...commonCacheOptions,
    ttl: inAnHour.diff(now),
  }
);

const cachedCoaApi = setupCache(
  axios.create({
    baseURL: import.meta.env.VITE_GATEWAY_URL,
  }),
  {
    ...commonCacheOptions,
    ttl: coaCacheExpiration.diff(now),
  }
);

export { cachedCoaApi, cachedUserApi };
