import { Errorable } from "~socket.io-services/types";

export default abstract class {
  static namespaceEndpoint = "/login";
  abstract login: (
    data: { username: string; password: string },
    callback: (data: Errorable<string, "Invalid username or password">) => void
  ) => void;
  abstract getCsrf: (callback: (value: string) => void) => void;


  abstract loginAsDemo: (
    callback: (data: Errorable<{ token: string }, "No demo user found">) => void
  ) => void;
}
