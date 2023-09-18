import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { useRouter } from 'vue-router';

import { User } from './persistence/models/dm/User';

import { app } from '~/stores/app';

axios.defaults.baseURL = import.meta.env.VITE_DM_API_URL;

export const createAxios = (baseURL: string): AxiosInstance => {
  const newInstance = axios.create({ baseURL });
  addUrlParamsRequestInterceptor(newInstance);

  return newInstance;
};

export const addTokenRequestInterceptor = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const users = await app().dbInstance.getRepository(User).find();
    const token = users?.[0]?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return axiosInstance;
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      await app().dbInstance.getRepository(User).delete(1);

      const router = useRouter();
      router.push('/');
    }
  },
);

export const addUrlParamsRequestInterceptor = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.url) {
      const currentUrl = new URL(config.url, config.baseURL);
      currentUrl.pathname = Object.entries(config.urlParams ?? ({} as Record<string, string>)).reduce(
        (pathname, [k, v]) => pathname.replace(`:${k}`, encodeURIComponent(v)),
        currentUrl.pathname,
      );
      return {
        ...config,
        baseURL: `${currentUrl.protocol}//${currentUrl.host}`,
        url: currentUrl.pathname,
      };
    }
    return config;
  });
  return axiosInstance;
};

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }

  interface AxiosRequestConfig {
    urlParams?: Record<string, string> | undefined;
  }
}
