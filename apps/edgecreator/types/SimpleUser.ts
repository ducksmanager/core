import { user } from "~prisma-clients/client_dm";

export type SimpleUser = Pick<user, "id" | "username">;
