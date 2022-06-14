import { runQuery } from "~/server/fetch";

export default defineEventHandler(async () => {
  return [
    ...(await retrieveSignups()).data,
    ...(await retrieveCollectionUpdates()).data,
    ...(await retrieveCollectionSubscriptionAdditions()).data,
    ...(await retrieveBookstoreCreations()).data,
    ...(await retrieveEdgeCreations()).data,
    ...(await retrieveNewMedals()).data,
  ];
});

const MEDAL_LEVELS = {
  Photographe: { 1: 50, 2: 150, 3: 600 },
  Createur: { 1: 20, 2: 70, 3: 150 },
  Duckhunter: { 1: 1, 2: 3, 3: 5 },
};

const retrieveSignups = async () =>
  await runQuery(
    `
          SELECT 'signup' as type, users.ID as userId, UNIX_TIMESTAMP(DateInscription) AS timestamp
          FROM users
          WHERE EXISTS(
            SELECT 1 FROM numeros WHERE users.ID = numeros.ID_Utilisateur
            )
            AND DateInscription > date_add(now(), interval -1 month)
            AND users.username NOT LIKE 'test%'
        `,
    "dm"
  );

const retrieveCollectionUpdates = async () =>
  await runQuery(
    `
          SELECT 'collection_update'       as type,
                 users.ID                  AS userId,
                 UNIX_TIMESTAMP(DateAjout) AS timestamp,
                 COUNT(Numero)             AS numberOfIssues,
                 (SELECT CONCAT(Pays, '/', Magazine, '/', Numero)
                  FROM numeros n
                  WHERE n.ID = numeros.ID
                  LIMIT 1)                 AS exampleIssue
          FROM numeros
                 INNER JOIN users ON numeros.ID_Utilisateur = users.ID
          WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
            AND users.username <> 'demo'
            AND users.username NOT LIKE 'test%'
            AND numeros.Abonnement = 0
          GROUP BY users.ID, DATE(DateAjout)
          HAVING COUNT(Numero) > 0
        `,
    "dm"
  );

const retrieveCollectionSubscriptionAdditions = async () =>
  await runQuery(
    `
          SELECT 'subscription_additions'                    as type,
                 CONCAT(numeros.Pays, '/', numeros.Magazine) AS publicationCode,
                 numeros.Numero                              AS issueNumber,
                 GROUP_CONCAT(numeros.ID_Utilisateur)        AS users,
                 UNIX_TIMESTAMP(DateAjout)                   AS timestamp
          FROM numeros
          WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
            AND numeros.Abonnement = 1
          GROUP BY DATE(DateAjout), numeros.Pays, numeros.Magazine, numeros.Numero
        `,
    "dm"
  );

const retrieveBookstoreCreations = async () =>
  await runQuery(
    `
          SELECT 'bookstore_comment'                                 as type,
                 uc.ID_user                                          AS userId,
                 bouquineries.Nom                                    AS name,
                 UNIX_TIMESTAMP(bouquineries_commentaires.DateAjout) AS timestamp
          FROM bouquineries_commentaires
                 INNER JOIN bouquineries ON bouquineries_commentaires.ID_Bouquinerie = bouquineries.ID
                 INNER JOIN users_contributions uc ON bouquineries_commentaires.ID = uc.ID_bookstore_comment
          WHERE bouquineries_commentaires.Actif = 1
            AND bouquineries_commentaires.DateAjout > date_add(now(), interval -1 month)
        `,
    "dm"
  );

const retrieveEdgeCreations = async () =>
  await runQuery(
    `
          select 'edge'                       as type,
                 CONCAT('[', GROUP_CONCAT(json_object(
                   'publicationCode',
                   publicationcode,
                   'issueNumber',
                   issuenumber
                   )), ']')                   AS edges,
                 UNIX_TIMESTAMP(creationDate) AS timestamp,
                 users
          from (SELECT tp.publicationcode,
                       tp.issuenumber,
                       tp.dateajout                       AS creationDate,
                       GROUP_CONCAT(DISTINCT tpc.ID_user) AS users
                FROM tranches_pretes tp
                       INNER JOIN users_contributions tpc ON tpc.ID_tranche = tp.ID
                WHERE tp.dateajout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
                  AND NOT (tp.publicationcode = 'fr/JM' AND tp.issuenumber REGEXP '^[0-9]+$')
                  AND NOT (tp.publicationcode = 'be/MMN')
                  AND NOT (tp.publicationcode = 'it/TL')
                GROUP BY tp.ID) as edges_and_collaborators
          group by DATE_FORMAT(creationDate, '%Y-%m-%d %H:00:00'), edges_and_collaborators.users
        `,
    "dm"
  );

const retrieveNewMedals = async () =>
  await runQuery(
    Object.entries(MEDAL_LEVELS)
      .map(([medalType, niveaux]) =>
        Object.values(niveaux)
          .map(
            (niveau: number) => `
                select 'medal'                   as type,
                     ID_User                   AS userId,
                     contribution,
                     ${niveau}                 as niveau,
                     UNIX_TIMESTAMP(date) - 60 AS timestamp
                from users_contributions
                where contribution = '${medalType.toLowerCase()}'
                and points_total >= ${niveau}
                and points_total - points_new < ${niveau}
                and date > DATE_ADD(NOW(), INTERVAL -1 MONTH)`
          )
          .join(" UNION ")
      )
      .join(" UNION "),
    "dm"
  );
