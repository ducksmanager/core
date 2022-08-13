import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";

dotenv.config({
  path: "../.env"
});

const CHUNKABLE_URLS: { [key: string]: number } = {
  "/coa/list/countries": 50,
  "/coa/list/publications": 10
};


const addAxiosInterceptor = (role: string) => {
  const auth = { username: role, password: process.env[`ROLE_PASSWORD_${role.toUpperCase()}`] };
  axios.interceptors.request.use((config) => ({
    ...config,
    auth,
    headers: {
      ...config.headers,
      "x-dm-version": "1.0.0",
      "Content-Type": "application/json"
    }
  }));
};


export const call = async (url: string, role: string, parameters: any[] | { [key: string]: any } = [], method: string = "GET", doNotChunk: boolean = false, userCredentials = [], noParse: boolean = false): Promise<AxiosResponse> => {
  addAxiosInterceptor(role);
  if (!doNotChunk && CHUNKABLE_URLS[url]) {
    //   return callWithChunks(url, role, parameters, method);
  }
  let fullUrl = process.env.BACKEND_URL + url

  const params = new URLSearchParams();
  if (method === "GET") {
    if (parameters.length) {
      fullUrl += "/" + parameters.join("/");
    }
  } else {
    for (const [paramKey, paramValue] of Object.entries(parameters)) {
      params.append(paramKey, paramValue);
    }
  }

  return await axios
    .request({
      method,
      url: fullUrl,
      data: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
        "x-dm-version": "1.0"
        // 'x-dm-user': (userCredentials['dm-user'] ?? (user ? user->getUsername() : '')),
        // 'x-dm-pass': (userCredentials['dm-pass'] ?? (user ? user->getPassword() : ''))
      }
    }).catch((e) => {
      throw e
    });
};