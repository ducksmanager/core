import { Errorable } from "../types";

export interface Services {
  loginAsDemo: (
    callback: (data: Errorable<{ token: string }, "No demo user found">) => void
  ) => void;
}

export const NamespaceEndpoint = "/demo";
