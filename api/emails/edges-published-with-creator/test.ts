import { PrismaClient } from "~/dist/prisma/client_dm";
import { i18n } from "~/emails";
import EdgesPublishedWithCreator from "~/emails/edges-published-with-creator/index";

const prisma = new PrismaClient();

prisma.user.findUniqueOrThrow({ where: { id: 999 } }).then(async (user) => {
  const email = new EdgesPublishedWithCreator({
    user,
    newMedalLevel: 1,
    extraEdges: 12,
    extraCreatorPoints: 120,
    locale: i18n.getLocale(),
  });
  await email.send();
});
