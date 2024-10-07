import { user } from "~prisma-schemas/client_dm";

export type SimpleUser = Pick<user, "id" | "username">;
