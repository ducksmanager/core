import axios from "axios";
import { buildWebStorage, setupCache } from "axios-cache-interceptor";

const customStorage = buildWebStorage(sessionStorage);

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

const commonCacheOptions = {
  etag: false,
  modifiedSince: false,
  interpretHeader: false,
  storage: customStorage,
};

const cachedL10nApi = setupCache(axios.create(), {
  ...commonCacheOptions,
  ttl: inAMonth - now,
});

const cachedUserApi = setupCache(axios.create(), {
  ...commonCacheOptions,
  ttl: inAnHour - now,
});

const cachedCoaApi = setupCache(axios.create(), {
  ...commonCacheOptions,
  ttl: coaCacheExpiration - now,
});

export { cachedCoaApi, cachedL10nApi, cachedUserApi };
