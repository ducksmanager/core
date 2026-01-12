import type { user } from "~prisma-schemas/schemas/dm/client/client";

export type SimpleUser = Pick<user, "id" | "username">;
