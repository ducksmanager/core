import { Errorable } from "../types";

export interface Services {
  forgot: (token: string, callback: (data: { error?: string }) => void) => void;
  requestTokenForForgotPassword: (
    email: string,
    callback: (data: Errorable<{ token: string }, "Invalid email">) => void
  ) => void;

  changePassword: (
    data: { password: string; password2: string; token: string },
    callback: (
      value: Errorable<
        { token: string },
        | "Invalid token"
        | "Your password should be at least 6 characters long"
        | "The two passwords should be identical"
        | "Something went wrong"
      >
    ) => void
  ) => void;
}

export const NamespaceEndpoint = "/auth";
