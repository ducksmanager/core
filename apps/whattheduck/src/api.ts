import axios from 'axios';
import { buildStorage, setupCache } from 'axios-cache-interceptor';
import { addUrlParamsRequestInterceptor, addTokenRequestInterceptor } from '~axios-helper';
import { createCachedCoaApi, getCommonCacheOptions } from '~web';

import { User } from '~/persistence/models/dm/User';
import { HttpCache } from '~/persistence/models/internal/HttpCache';
import { app } from '~/stores/app';

const sqliteStorage = buildStorage({
  set: async (key, data) => {
    await app()
      .dbInstance.getRepository(HttpCache)
      .upsert({ key, data: JSON.stringify(data) }, ['key']);
  },
  find: async (key) => {
    const data = (await app().dbInstance.getRepository(HttpCache).findOne({ where: { key } }))?.data;
    if (data) {
      return JSON.parse(data);
    }
  },
  remove: async (key) => {
    await app().dbInstance.getRepository(HttpCache).delete({ key });
  },
});

export const coaApi = createCachedCoaApi(sqliteStorage, import.meta.env.VITE_DM_API_URL);

export const defaultApi = addTokenRequestInterceptor(
  addUrlParamsRequestInterceptor(
    setupCache(
      axios.create({
        baseURL: import.meta.env.VITE_DM_API_URL,
      }),
      getCommonCacheOptions(sqliteStorage),
    ),
  ),
  async () =>
    app()
      .dbInstance.getRepository(User)
      .find({ select: ['token'] })
      .then(([{ token }]) => token)
      .catch(() => undefined),
);
