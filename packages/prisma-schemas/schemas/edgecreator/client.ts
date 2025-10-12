import { getEdgeCreatorClient } from "../../utils/singleton-clients";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getEdgeCreatorClient> | null = null;

export const prismaClient = new Proxy(
  {} as ReturnType<typeof getEdgeCreatorClient>,
  {
    get(_target, prop) {
      if (!_prismaClient) {
        _prismaClient = getEdgeCreatorClient();
      }
      return _prismaClient[prop as keyof typeof _prismaClient];
    },
  },
);
