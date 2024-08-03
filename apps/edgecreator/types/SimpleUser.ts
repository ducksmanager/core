import type { user } from "~prisma-schemas/schemas/dm";

export type SimpleUser = Pick<user, "id" | "username">;
