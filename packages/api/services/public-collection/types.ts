import type { issue } from "~prisma-clients/client_dm";
import type { Errorable } from "~socket.io-services/types";

export default abstract class {
  static namespaceEndpoint = "/public-collection";
  
  abstract getPublicCollection: (
    username: string,
    callback: (
      value: Errorable<
        {issues: issue[]},
        "User not found" | "This user does not allow sharing"
      >
    ) => void
  ) => void;
}

