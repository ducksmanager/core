import { PrismaClient } from "~prisma_clients/client_dm";
import { ExpressCall } from "~routes/_express-call";
import { Call } from "~types/Call";

const prisma = new PrismaClient();

export type getCall = Call<{
  userScores: { userId: number; averageRarity: number }[];
  myScore: number;
}>;
export const get = async (...[req, res]: ExpressCall<getCall>) => {
  const userCount = await prisma.user.count();
  const userScores = (await prisma.$queryRaw`
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
