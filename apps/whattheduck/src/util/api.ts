import axios from 'axios';

import { addTokenRequestInterceptor, addUrlParamsRequestInterceptor } from '~/axios-helper';

const coaApi = addUrlParamsRequestInterceptor(
  axios.create({
    baseURL: import.meta.env.VITE_DM_API_URL,
  }),
);

const defaultApi = addTokenRequestInterceptor(
  addUrlParamsRequestInterceptor(axios.create({ baseURL: import.meta.env.VITE_DM_API_URL })),
);

export { coaApi, defaultApi };
