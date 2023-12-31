import { Errorable } from "../types";

export interface Services {
  login: (
    data: { username: string; password: string },
    callback: (data: Errorable<string, "Invalid username or password">) => void
  ) => void;
  getCsrf: (callback: (value: string) => void) => void;
}

export const NamespaceEndpoint = "/login";
