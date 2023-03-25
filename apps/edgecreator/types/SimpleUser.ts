import { user } from "ducksmanager/api/dist/prisma/client_dm";

export type SimpleUser = Pick<user, "id" | "username">;
