import { getCoverInfoClient } from "../../utils/singleton-clients";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getCoverInfoClient> | null = null;

export const prismaClient = new Proxy({} as ReturnType<typeof getCoverInfoClient>, {
  get(target, prop) {
    if (!_prismaClient) {
      _prismaClient = getCoverInfoClient();
    }
    return _prismaClient[prop as keyof typeof _prismaClient];
  }
});
