import dayjs from "dayjs";
import type { Namespace, Server } from "socket.io";

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
import { prismaDm } from "~prisma-clients";

import type Events from "./types";
import { namespaceEndpoint } from "./types";

export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to events");

    socket.on("getEvents", (callback) =>
      Promise.all([
        retrieveSignups(),
        retrieveCollectionUpdates(),
        retrieveCollectionSubscriptionAdditions(),
        retrieveBookstoreCreations(),
        retrieveEdgeCreations(),
        retrieveNewMedals(),
      ])
        .then((data) => data.flat())
        .then(callback),
    );
  });
};

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
        FROM dm.users
        WHERE EXISTS(
                SELECT 1 FROM dm.numeros WHERE users.ID = numeros.ID_Utilisateur
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
               (SELECT CONCAT(Pays, '/', Magazine, '/', Numero)
                FROM dm.numeros n
                WHERE n.ID = numeros.ID
                LIMIT 1)                 AS exampleIssue
        FROM dm.numeros
                 INNER JOIN dm.users ON numeros.ID_Utilisateur = users.ID
        WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
          AND users.username <> 'demo'
          AND users.username NOT LIKE 'test%'
          AND numeros.Abonnement = 0
        GROUP BY users.ID, DATE(DateAjout)
        HAVING COUNT(Numero) > 0
    `
  ).map((event) => {
    const [publicationcode, issuenumber] =
      event.exampleIssue.split(/\/(?=[^/]+$)/);
    return {
      ...mapUsers<CollectionUpdateEvent>(event),
      numberOfIssues: event.numberOfIssues,
      publicationcode: publicationcode || "",
      issuenumber: issuenumber || "",
    } as CollectionUpdateEvent;
  });

const retrieveCollectionSubscriptionAdditions = async (): Promise<
  CollectionSubscriptionAdditionEvent[]
> =>
  (
    await prismaDm.$queryRaw<CollectionSubscriptionAdditionEventRaw[]>`
        SELECT 'subscription_additions'                    as type,
               CONCAT(numeros.Pays, '/', numeros.Magazine) AS publicationcode,
               numeros.Numero                              AS issuenumber,
               GROUP_CONCAT(numeros.ID_Utilisateur)        AS users,
               UNIX_TIMESTAMP(DateAjout)                   AS timestamp
        FROM dm.numeros
        WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
          AND numeros.Abonnement = 1
        GROUP BY DATE(DateAjout), numeros.Pays, numeros.Magazine, numeros.Numero
    `
  ).map(mapUsers<CollectionSubscriptionAdditionEvent>);

const retrieveBookstoreCreations = async (): Promise<BookstoreCommentEvent[]> =>
  (
    await prismaDm.$queryRaw<AbstractEventRaw[]>`
        SELECT 'bookstore_comment'                                 as type,
               uc.ID_user                                          AS userId,
               bouquineries.Nom                                    AS name,
               UNIX_TIMESTAMP(bouquineries_commentaires.DateAjout) AS timestamp
        FROM dm.bouquineries_commentaires
                 INNER JOIN dm.bouquineries ON bouquineries_commentaires.ID_Bouquinerie = bouquineries.ID
                 INNER JOIN dm.users_contributions uc ON bouquineries_commentaires.ID = uc.ID_bookstore_comment
        WHERE bouquineries_commentaires.Actif = 1
          AND bouquineries_commentaires.DateAjout > date_add(now(), interval -1 month)
    `
  ).map(mapUsers<BookstoreCommentEvent>);

const retrieveEdgeCreations = async (): Promise<EdgeCreationEvent[]> =>
  (
    await prismaDm.$queryRaw<EdgeCreationEventRaw[]>`
        select 'edge'                       as type,
               CONCAT('[', GROUP_CONCAT(json_object(
                       'publicationcode',
                       publicationcode,
                       'issuenumber',
                       issuenumber
                   )), ']')                 AS edges,
               UNIX_TIMESTAMP(creationDate) AS timestamp,
               users
        from (SELECT tp.publicationcode,
                     tp.issuenumber,
                     tp.dateajout                       AS creationDate,
                     GROUP_CONCAT(DISTINCT tpc.ID_user) AS users
              FROM dm.tranches_pretes tp
                       INNER JOIN dm.users_contributions tpc ON tpc.ID_tranche = tp.ID
              WHERE tp.dateajout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
                AND NOT (tp.publicationcode = 'fr/JM' AND tp.issuenumber REGEXP '^[0-9]+$')
                AND NOT (tp.publicationcode = 'be/MMN')
                AND NOT (tp.publicationcode = 'it/TL')
                AND NOT (tp.publicationcode = 'se/WDS')
              GROUP BY tp.ID) as edges_and_collaborators
        group by DATE_FORMAT(creationDate, '%Y-%m-%d %H:00:00'), edges_and_collaborators.users
    `
  ).map((event) => ({
    ...mapUsers<EdgeCreationEvent>(event),
    edges: JSON.parse(event.edges),
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
