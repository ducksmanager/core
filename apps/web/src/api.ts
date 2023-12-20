import axios from "axios";
import {
  CacheOptions,
  CacheRequestConfig,
  setupCache,
} from "axios-cache-interceptor";
import dayjs from "dayjs";

import { addUrlParamsRequestInterceptor } from "~axios-helper";

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

export const getCommonCacheOptions = (
  storage: CacheOptions["storage"],
): CacheOptions => ({
  etag: false,
  modifiedSince: false,
  interpretHeader: false,
  generateKey: (options: CacheRequestConfig) =>
    `${options.method} ${options.url}${
      options.params ? new URLSearchParams(options.params).toString() : ""
    }`,
  storage: storage,
});

export const createCachedCoaApi = (
  storage: CacheOptions["storage"],
  baseURL: string,
) =>
  addUrlParamsRequestInterceptor(
    setupCache(
      axios.create({
        baseURL,
      }),
      {
        ...getCommonCacheOptions(storage),

        generateKey: (options: CacheRequestConfig) =>
          `${options.method} ${options.url}${
            options.params ? new URLSearchParams(options.params).toString() : ""
          } ${options.data ? JSON.stringify(options.data) : ""}`,
        methods: ["get", "post"],
        ttl: coaCacheExpiration.diff(now),
      },
    ),
  );

// export type CachedSocket<T extends EventsMap> = {
//   emitWithAckCached: Socket["emitWithAck"];
// };

// export const createCachedCoaSocket = (
//   storage: CacheOptions["storage"],
//   baseURL: string,
// ): CachedSocket<CoaServices> => {
//   const socket: Socket<CoaServices> = io(baseURL + "/coa");

//   const emitWithAckCached = async (ev: Parameters<typeof socket['emitWithAck']>[0], ...args: Parameters<typeof socket['emitWithAck']>) => {
//     const cachedValue = await storage!.get(JSON.stringify(args));
//     if (cachedValue.state === "cached") {
//       return cachedValue.data as Awaited<ReturnType<Socket["emitWithAck"]>>;
//     }
//     const response = await socket.emitWithAck(ev, ...args);
//     storage?.set(JSON.stringify(args), response as NotEmptyStorageValue);
//     return response;
//   };
//   return {emitWithAckCached};
// };

export const createCachedUserApi = (
  storage: CacheOptions["storage"],
  baseURL: string,
) =>
  addUrlParamsRequestInterceptor(
    setupCache(
      axios.create({
        baseURL,
      }),
      {
        ...getCommonCacheOptions(storage),
        ttl: inAnHour.diff(now),
      },
    ),
  );
