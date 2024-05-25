import type { Errorable } from "~socket.io-services/types";

export const namespaceEndpoint = "/auth";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract forgot: (
    token: string,
    callback: (data: { error?: string }) => void,
  ) => void;
  abstract requestTokenForForgotPassword: (
    email: string,
    callback: (data: Errorable<{ token: string }, "Invalid email">) => void,
  ) => void;

  abstract changePassword: (
    data: { password: string; password2: string; token: string },
    callback: (
      value: Errorable<
        { token: string },
        | "Invalid token"
        | "Your password should be at least 6 characters long"
        | "The two passwords should be identical"
        | "Something went wrong"
      >,
    ) => void,
  ) => void;
}
