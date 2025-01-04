import dayjs from "dayjs";

import type {
  AbstractEvent,
  AbstractEventRaw,
} from "~dm-types/events/AbstractEvent";
import type { BookstoreCommentEvent } from "~dm-types/events/BookstoreCommentEvent";
import type {
  CollectionSubscriptionAdditionEvent,
  CollectionSubscriptionAdditionEventRaw,
} from "~dm-types/events/CollectionSubscriptionAdditionEvent";
import type {
  CollectionUpdateEvent,
  CollectionUpdateEventRaw,
} from "~dm-types/events/CollectionUpdateEvent";
import type {
  EdgeCreationEvent,
  EdgeCreationEventRaw,
} from "~dm-types/events/EdgeCreationEvent";
import type { MedalEvent } from "~dm-types/events/MedalEvent";
import type { SignupEvent } from "~dm-types/events/SignupEvent";
import { prismaClient as prismaDm } from "~prisma-schemas/schemas/dm/client";
import { useSocketServices } from "~socket.io-services";

import namespaces from "../namespaces";

const listenEvents = () => ({
  getEvents: () =>
    Promise.all([
      retrieveSignups(),
      retrieveCollectionUpdates(),
      retrieveCollectionSubscriptionAdditions(),
      retrieveBookstoreCreations(),
      retrieveEdgeCreations(),
      retrieveNewMedals(),
    ]).then((data) => data.flat()),
});

export const { client, server } = useSocketServices<typeof listenEvents>(
  namespaces.EVENTS,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];

const MEDAL_LEVELS = {
  edge_photographer: { 1: 50, 2: 150, 3: 600 },
  edge_designer: { 1: 20, 2: 70, 3: 150 },
  duckhunter: { 1: 1, 2: 3, 3: 5 },
};

const MEDALS_L10N_FR: Record<string, string> = {
  edge_photographer: "photographe",
  edge_designer: "createur",
  duckhunter: "duckhunter",
};

const mapUsers = <T extends AbstractEvent>(event: AbstractEventRaw): T =>
  ({
    ...event,

    users:
      event.users?.split(",")?.map((userId) => parseInt(userId)) ||
      (event.userId && [event.userId]) ||
      [],
  }) as T;

const retrieveSignups = async (): Promise<SignupEvent[]> =>
  (
    await prismaDm.$queryRaw<AbstractEventRaw[]>`
        SELECT 'signup' as type, users.ID as userId, UNIX_TIMESTAMP(DateInscription) AS timestamp
        FROM users
        WHERE EXISTS(
                SELECT 1 FROM numeros WHERE users.ID = numeros.ID_Utilisateur
            )
          AND DateInscription > date_add(now(), interval -1 month)
          AND users.username NOT LIKE 'test%'
    `
  ).map(mapUsers<SignupEvent>);

const retrieveCollectionUpdates = async (): Promise<CollectionUpdateEvent[]> =>
  (
    await prismaDm.$queryRaw<CollectionUpdateEventRaw[]>`
        SELECT 'collection_update'       as type,
               users.ID                  AS userId,
               UNIX_TIMESTAMP(DateAjout) AS timestamp,
               COUNT(Numero)             AS numberOfIssues,
               (SELECT issuecode
                FROM numeros n
                WHERE n.ID = numeros.ID
                LIMIT 1)                 AS exampleIssuecode
        FROM numeros
                 INNER JOIN users ON numeros.ID_Utilisateur = users.ID
        WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
          AND users.username <> 'demo'
          AND users.username NOT LIKE 'test%'
          AND numeros.Abonnement = 0
        GROUP BY users.ID, DATE(DateAjout)
        HAVING COUNT(Numero) > 0
    `
  ).map((event) => mapUsers(event));

const retrieveCollectionSubscriptionAdditions = async (): Promise<
  CollectionSubscriptionAdditionEvent[]
> =>
  (
    await prismaDm.$queryRaw<CollectionSubscriptionAdditionEventRaw[]>`
        SELECT 'subscription_additions'                    as type,
               issue.issuecode,
               GROUP_CONCAT(ID_Utilisateur)        AS users,
               UNIX_TIMESTAMP(DateAjout)                   AS timestamp
        FROM numeros AS issue
        WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
          AND issue.Abonnement = 1
        GROUP BY DATE(DateAjout), issue.issuecode
    `
  ).map(mapUsers<CollectionSubscriptionAdditionEvent>);

const retrieveBookstoreCreations = async (): Promise<BookstoreCommentEvent[]> =>
  (
    await prismaDm.$queryRaw<AbstractEventRaw[]>`
        SELECT 'bookstore_comment'                                 as type,
               uc.ID_user                                          AS userId,
               bouquineries.Nom                                    AS name,
               UNIX_TIMESTAMP(bouquineries_commentaires.DateAjout) AS timestamp
        FROM bouquineries_commentaires
                 INNER JOIN bouquineries ON bouquineries_commentaires.ID_Bouquinerie = bouquineries.ID
                 INNER JOIN users_contributions uc ON bouquineries_commentaires.ID = uc.ID_bookstore_comment
        WHERE bouquineries_commentaires.Actif = 1
          AND bouquineries_commentaires.DateAjout > date_add(now(), interval -1 month)
    `
  ).map(mapUsers<BookstoreCommentEvent>);

const retrieveEdgeCreations = async (): Promise<EdgeCreationEvent[]> =>
  (
    await prismaDm.$queryRaw<EdgeCreationEventRaw[]>`
        select 'edge'                       AS type,
               GROUP_CONCAT(issuecode)      AS issuecodes,
               UNIX_TIMESTAMP(creationDate) AS timestamp,
               users
        from (SELECT tp.issuecode,
                     tp.dateajout                       AS creationDate,
                     GROUP_CONCAT(DISTINCT tpc.ID_user) AS users
              FROM tranches_pretes tp
                       INNER JOIN users_contributions tpc ON tpc.ID_tranche = tp.ID
              WHERE tp.dateajout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
                AND NOT (tp.publicationcode = 'fr/JM' AND tp.issuenumber REGEXP '^[0-9]+$')
                AND tp.publicationcode NOT IN ('be/MMN', 'it/TL', 'se/WDS')
              GROUP BY tp.ID) as edges_and_collaborators
        group by DATE_FORMAT(creationDate, '%Y-%m-%d %H:00:00'), edges_and_collaborators.users
        having count(issuecode) > 0
    `
  ).map((event) => ({
    ...mapUsers<EdgeCreationEvent>(event),
    issuecodes: event.issuecodes.split(","),
  }));

const retrieveNewMedals = async () =>
  (
    (
      await prismaDm.userContribution.findMany({
        select: {
          totalPoints: true,
          newPoints: true,
          userId: true,
          contribution: true,
          date: true,
        },
        where: {
          date: {
            gt: dayjs().subtract(1, "month").toDate(),
          },
        },
      })
    )
      .map(({ contribution, newPoints, totalPoints, userId, date }) => ({
        contribution: Object.keys(MEDALS_L10N_FR).find(
          (medalType) => MEDALS_L10N_FR[medalType] === contribution,
        ),
        userId,
        timestamp: dayjs(date).subtract(2, "hour").unix(),
        type: "medal",
        level:
          Object.entries(
            Object.entries(MEDAL_LEVELS).find(
              ([medalType]) => contribution === MEDALS_L10N_FR[medalType],
            )![1],
          ).find(
            ([, points]) =>
              totalPoints >= points && totalPoints - newPoints < points,
          )?.[0] || null,
      }))
      .filter(({ level }) => level !== null) as AbstractEventRaw[]
  ).map(mapUsers<MedalEvent>);
