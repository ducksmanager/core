import { prismaDm } from "~/prisma";
import { ExpressCall } from "~routes/_express-call";

export const get = async (
  ...[req, res]: ExpressCall<{
    resBody: {
      me: {
        rank: number;
        rarestIssue: {
          issuecode: string;
          numberOfOwners: number;
        };
      };
      aboveMe: {
        userId: number;
      };
    };
  }>
) => {
  const userCount = await prismaDm.user.count();
  const userScores = (await prismaDm.$queryRaw`
      WITH issues_rarity AS (SELECT issuecode,
                              count(*) AS number_of_owners,
                              IF(
                                      count(*) = 0, 0,
                                      pow(${userCount} / count(*), 1.5) / 10000
                              ) as rarity
                       FROM numeros
                       GROUP BY issuecode),
     user_issues AS (SELECT numeros.ID_Utilisateur,
                            numeros.issuecode,
                            issues_rarity.rarity,
                            issues_rarity.number_of_owners
                     FROM numeros
                              LEFT JOIN issues_rarity USING (issuecode))
    SELECT ID                    AS userId,
          round(sum(ui.rarity)) AS rarityScore,
          (SELECT ui2.issuecode
            FROM user_issues ui2
            WHERE ui2.ID_Utilisateur = ui.ID_Utilisateur
            ORDER BY ui2.rarity DESC, issuecode
            LIMIT 1)             AS rarestIssuecode,
          (SELECT number_of_owners
            FROM user_issues ui3
            WHERE ui3.ID_Utilisateur = ui.ID_Utilisateur
            ORDER BY ui3.rarity DESC, issuecode
            LIMIT 1)             AS rarestIssueNumberOfOwners
    FROM user_issues ui
            INNER JOIN users ON users.ID = ui.ID_Utilisateur
    GROUP BY ui.ID_Utilisateur, username
    ORDER BY rarityScore DESC
  `) as {
    userId: number;
    rarityScore: number;
    rarestIssuecode: string;
    rarestIssueNumberOfOwners: number;
  }[];

  const myRank =
    userScores.findIndex(({ userId }) => userId === req.user!.id) || 0;

  return res.json({
    me: {
      rank: myRank + 1,
      rarestIssue: {
        issuecode: userScores[myRank].rarestIssuecode,
        numberOfOwners: userScores[myRank].rarestIssueNumberOfOwners,
      },
    },
    aboveMe: {
      userId: userScores[myRank - 1]?.userId,
    },
  });
};
