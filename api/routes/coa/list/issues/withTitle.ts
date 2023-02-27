import { PrismaClient } from "~prisma_clients/client_coa";
import { ExpressCall } from "~routes/_express-call";

const prisma = new PrismaClient();

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      issuenumber: string;
      title: string | null;
    }[];
    query: { publicationcode: string };
  }>
) => {
  const { publicationcode } = req.query as { [key: string]: string };
  if (!publicationcode) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end();
    return;
  }
  const data = await prisma.inducks_issue.findMany({
    select: {
      issuenumber: true,
      title: true,
    },
    where: {
      publicationcode,
    },
  });
  return res.json(
    data.map(({ issuenumber, title }) => ({
      issuenumber: issuenumber!.replace(/ +/g, " "),
      title,
    }))
  );
};
