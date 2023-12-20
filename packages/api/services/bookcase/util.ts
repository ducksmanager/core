import { prismaDm } from "~/prisma";

import { user } from "../../../prisma-clients/client_dm";
import { User } from "../../../types/SessionUser";

export const checkValidBookcaseUser = async (
    user?: User|null,
    username?: string
  ): Promise<user> => {
    const dbUser = await prismaDm.user.findFirstOrThrow({
      where: { username },
    });
    if (user?.id === dbUser.id || dbUser.allowSharing) {
      return dbUser;
    } else if (!user) {
      throw new Error("401");
    } else throw new Error("403");
  };