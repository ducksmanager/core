import { prismaDm } from "~/prisma";
import { WantedEdge } from "~dm-types/WantedEdge";
import { ExpressCall } from "~routes/_express-call";

export const get = async (...[, res]: ExpressCall<{ resBody: WantedEdge[] }>) =>
  res.json(
    (await prismaDm.$queryRaw`
      SELECT Count(Numero) as numberOfIssues, publicationcode, issuecode
      FROM numeros
      WHERE NOT EXISTS(
        SELECT 1
        FROM tranches_pretes
        WHERE numeros.issuecode = tranches_pretes.issuecode
      )
      GROUP BY issuecode
      ORDER BY numberOfIssues DESC, issuecode
      LIMIT 20
    `) as WantedEdge[]
  );
