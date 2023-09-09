import { prismaDm } from "~/prisma";

import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      userScores: { userId: number; averageRarity: number }[];
      myScore: number;
    };
  }>
) => {
  const userCount = await prismaDm.user.count();
  const userScores = (await prismaDm.$queryRaw`
      SELECT ID_Utilisateur AS userId, round(sum(rarity)) AS averageRarity
      FROM numeros
      LEFT JOIN
        (select issuecode, pow(${userCount} / count(*), 1.5) / 10000 as rarity
        from numeros n1
        group by issuecode) AS issues_rarity ON numeros.issuecode = issues_rarity.issuecode
      GROUP BY ID_Utilisateur
      ORDER BY averageRarity
  `) as { userId: number; averageRarity: number }[];

  const myScore =
    userScores.find(({ userId }) => userId === req.user!.id)?.averageRarity ||
    0;

  return res.json({
    userScores,
    myScore,
  });
};
