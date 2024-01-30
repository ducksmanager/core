import { issue } from "~prisma-clients/client_dm";

import { Errorable } from "../types";

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

