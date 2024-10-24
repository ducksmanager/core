import type { issue } from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services";

export const namespaceEndpoint = "/public-collection";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getPublicCollection: (
    username: string,
    callback: (
      value: Errorable<
        { issues: issue[] },
        "User not found" | "This user does not allow sharing"
      >,
    ) => void,
  ) => void;
}
