import { user } from "~prisma_clients/client_dm";

export type SimpleUser = Pick<user, "id" | "username">;
