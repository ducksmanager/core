import localforage from "localforage";
import { setupCache } from "axios-cache-adapter";

const now = new Date();
let inAnHour = new Date();
inAnHour.setHours(inAnHour.getHours() + 1);

let inAMonth = new Date();
inAMonth.setMonth(inAMonth.getMonth() + 1);

let coaCacheExpiration = new Date();
if (now.getHours() >= 4) {
  coaCacheExpiration.setDate(now.getDate() + 1);
}
coaCacheExpiration.setHours(4);
coaCacheExpiration.setMinutes(0);
coaCacheExpiration.setSeconds(0);
coaCacheExpiration.setMilliseconds(0);

const appCache = setupCache({
  maxAge: inAMonth - now,
  store: localforage,
  exclude: {
    query: false,
  },
});

const userCache = setupCache({
  maxAge: inAnHour - now,
  store: localforage,
  invalidate: async (config, request) => {
    if (request.clearCacheEntry) {
      await config.store.removeItem(config.uuid);
    }
  },
});

const coaCache = setupCache({
  maxAge: coaCacheExpiration - now,
  store: localforage,
});

// Remove infinite cache set by mistake
localforage.keys((error, keys) => {
  keys.forEach((key) => {
    localforage.getItem(key, (error, value) => {
      if (
        (typeof value !== "object" && isNaN(value)) ||
        !value ||
        !value.expires ||
        typeof value.expires !== "number"
      ) {
        localforage.removeItem(key);
      }
    });
  });
});

export { appCache, userCache, coaCache };
