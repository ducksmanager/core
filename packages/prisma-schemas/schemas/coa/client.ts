import { getCoaClient } from "../../utils/singleton-clients";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getCoaClient> | null = null;

export const prismaClient = new Proxy({} as ReturnType<typeof getCoaClient>, {
  get(target, prop) {
    if (!_prismaClient) {
      _prismaClient = getCoaClient();
    }
    return _prismaClient[prop as keyof typeof _prismaClient];
  },
});
