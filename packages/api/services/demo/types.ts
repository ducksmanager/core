import { Errorable } from "../types";

export default abstract class DemoServices {
  static namespaceEndpoint: string = "/demo";

  abstract loginAsDemo: (
    callback: (data: Errorable<{ token: string }, "No demo user found">) => void
  ) => void;
}

export const DemoNamespaceEndpoint = "/demo";
