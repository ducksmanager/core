import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import dayjs from "dayjs";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
(async () => {
  const ongoingSubscriptions = await prismaDm.$queryRaw<
    {
      earliestReleaseDate: Date;
      latestReleaseDate: Date;
      publicationcode: string;
      userId: number;
    }[]
  >`
select subscriptions.*
from (select greatest(Date_debut, subdate(current_date, 14)) AS earliestReleaseDate,
             least(current_date, Date_fin)                   as latestReleaseDate,
             publicationcode,
             ID_Utilisateur                                  as userId
      from abonnements) subscriptions
where current_date between earliestReleaseDate and latestReleaseDate
`;

  for (const subscription of ongoingSubscriptions) {
    const earliestReleaseDate = dayjs(subscription.earliestReleaseDate).format(
      "YYYY-MM-DD",
    );
    const latestReleaseDate = dayjs(subscription.latestReleaseDate).format(
      "YYYY-MM-DD",
    );
    console.log(
      "Checking releases for user %s, publication %s, between %s and %s",
      subscription.userId,
      subscription.publicationcode,
      earliestReleaseDate,
      latestReleaseDate,
    );
    const releases = await prismaCoa.inducks_issue.findMany({
      where: {
        publicationcode: subscription.publicationcode,
        filledoldestdate: {
          gte: earliestReleaseDate,
          lte: latestReleaseDate,
        },
      },
    });
    for (const release of releases) {
      console.log(
        "Released issue: user %s, issue %s, release date",
        subscription.userId,
        release.issuecode,
        release.filledoldestdate,
      );

      if (
        !(await prismaDm.subscriptionRelease.count({
          where: {
            issuecode: release.issuecode,
          },
        }))
      ) {
        const [countrycode, magazinecode] = release.publicationcode.split("/");
        console.log(
          "Adding issue %s to user %s",
          release.issuecode,
          subscription.userId,
        );
        await prismaDm.subscriptionRelease.create({
          data: {
            countrycode,
            magazinecode,
            issuenumber: release.issuenumber,
            issuecode: release.issuecode,
            releaseDate: new Date(release.filledoldestdate!),
          },
        });
      }
    }
  }

  await prismaDm.$executeRaw`
INSERT IGNORE INTO numeros(Pays, Magazine, Numero, issuecode, Etat, ID_Acquisition, AV, Abonnement, ID_Utilisateur)
SELECT subscription.Pays,
       subscription.Magazine,
       issueRelease.Numero,
       issueRelease.issuecode,
       'bon',
       -1,
       0,
       1,
       subscription.ID_Utilisateur
FROM abonnements subscription
INNER JOIN abonnements_sorties as issueRelease using (Pays, Magazine)
WHERE Date_sortie
    BETWEEN greatest(subscription.Date_debut, subdate(current_date, 14))
        AND least(current_date, subscription.Date_fin)
  AND Numeros_ajoutes = 0
`;
  await prismaDm.$executeRaw`UPDATE abonnements_sorties SET Numeros_ajoutes=1`;
})();
