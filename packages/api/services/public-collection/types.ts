import type { issue } from "~prisma-clients/extended/dm.extends";
import type { Errorable } from "~socket.io-services/types";

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
