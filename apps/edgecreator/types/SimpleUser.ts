import type { user } from "~prisma-clients/schemas/dm";

export type SimpleUser = Pick<user, "id" | "username">;
