import { getDmClient } from "../../utils/singleton-clients";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getDmClient> | null = null;

export const prismaClient = new Proxy({} as ReturnType<typeof getDmClient>, {
  get(target, prop) {
    if (!_prismaClient) {
      _prismaClient = getDmClient();
    }
    return _prismaClient[prop as keyof typeof _prismaClient];
  },
});
