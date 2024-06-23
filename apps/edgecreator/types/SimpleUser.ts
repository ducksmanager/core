import type { user } from "~prisma-clients/extended/dm.extends";

export type SimpleUser = Pick<user, "id" | "username">;
