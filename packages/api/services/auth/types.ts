import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/auth" }
;export type Events = {
  forgot: (token: string) => { error?: string };
  requestTokenForForgotPassword: (
    email: string,
  ) => Errorable<{ token: string }, "Invalid email">;

  changePassword: (data: {
    password: string;
    password2: string;
    token: string;
  }) => Errorable<
    { token: string },
    | "Invalid token"
    | "Your password should be at least 6 characters long"
    | "The two passwords should be identical"
    | "Something went wrong"
  >;

  login: (data: {
    username: string;
    password: string;
  }) => Errorable<string, "Invalid username or password">;
  getCsrf: () => string;

  loginAsDemo: () => Errorable<{ token: string }, "No demo user found">;

  signup: (data: {
    username: string;
    password: string;
    email: string;
  }) => Errorable<string, "Bad request">;
};
