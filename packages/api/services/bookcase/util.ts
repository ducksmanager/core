import { prismaDm } from "~/prisma";
import { User } from "~dm-types/SessionUser";
import { user } from "~prisma-clients/client_dm";

import { Errorable } from "../types";

export const checkValidBookcaseUser = async (
  user?: User | null,
  username?: string
): Promise<Errorable<user, 'Unauthorized' | 'Forbidden' | 'Not found'>> => {
  try {
    const dbUser = await prismaDm.user.findFirstOrThrow({
      where: { username },
    });
    if (user?.id === dbUser.id || dbUser.allowSharing) {
      return dbUser;
    } else if (!user) {
      return { error: "Unauthorized" };
    } else return { error: "Forbidden" };
  }
  catch (error) {
    return { error: "Not found" };
  }
};