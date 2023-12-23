import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

import { getUser } from "./user";

export const post = async (
  ...[req, res]: ExpressCall<{ resBody: { previousVisit: Date | null } }>
) => {
  const user = await getUser(req.user!.id);
  if (!user) {
    res.writeHead(500);
    res.end("This user does not exist"); 
    return;
  }
  if (!user.lastAccess) {
    console.log(`Initializing last access for user ${req.user!.id}`);
    user.previousAccess = null;
    user.lastAccess = new Date();
  } else {
    console.log(`Updating last access for user ${req.user!.id}`);
    user.previousAccess = user.lastAccess;
    user.lastAccess = new Date();
  }
  prismaDm.user.update({
    data: user,
    where: {
      id: req.user!.id,
    },
  });

  return res.json({
    previousVisit: user.previousAccess,
  });
};
