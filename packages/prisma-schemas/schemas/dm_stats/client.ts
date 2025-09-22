import { getDmStatsClient } from "../../utils/singleton-clients";

// Lazy initialization to prevent multiple instances
let _prismaClient: ReturnType<typeof getDmStatsClient> | null = null;

export const prismaClient = new Proxy({} as ReturnType<typeof getDmStatsClient>, {
  get(target, prop) {
    if (!_prismaClient) {
      _prismaClient = getDmStatsClient();
    }
    return _prismaClient[prop as keyof typeof _prismaClient];
  }
});
