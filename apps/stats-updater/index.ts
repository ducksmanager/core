#!/usr/bin/env bun

import "~prisma-schemas/util/groupBy";

import {
  type inducks_issue,
  type inducks_storyjob,
  type inducks_storyversion,
  Prisma,
} from "~prisma-schemas/schemas/coa";
import type { authorUser } from "~prisma-schemas/schemas/dm";
import type { authorStory } from "~prisma-schemas/schemas/dm_stats";

import * as db from "./db";

const tables = [
  "auteurs_histoires",
  "histoires_publications",
  "utilisateurs_histoires_manquantes",
  "utilisateurs_publications_manquantes",
  "utilisateurs_publications_suggerees",
];

db.connect().then(async () => {
  const dbName = process.env.MYSQL_DM_STATS_DATABASE;
  await db.runQuery(`DROP DATABASE IF EXISTS ${dbName}_new`);
  await db.runQuery(`CREATE DATABASE ${dbName}_new`);

  const originalConnectionString = process.env.DATABASE_URL_DM_STATS!;

  process.env.DATABASE_URL_DM_STATS = originalConnectionString.replace(
    "dm_stats",
    "dm_stats_new",
  );
  const prismaDmStatsNew = (
    await import("~prisma-schemas/schemas/dm_stats/client")
  ).prismaClient;

  process.env.DATABASE_URL_DM = process.env.DATABASE_URL_DM;
  const prismaDm = (await import("~prisma-schemas/schemas/dm/client"))
    .prismaClient;

  process.env.DATABASE_URL_COA = process.env.DATABASE_URL_COA;
  const prismaCoa = (await import("~prisma-schemas/schemas/coa/client"))
    .prismaClient;

  await db.runMigrations();
  await db.generatePrismaClient();

  const authorUsers = await prismaDm.authorUser.findMany({
    where: {
      notation: {
        gt: 0,
      },
    },
  });
  const personcodes = Object.keys(authorUsers.groupBy("personcode"));
  const userIdsWithPersoncodes = Object.keys(authorUsers.groupBy("userId")).map(
    (userId) => parseInt(userId),
  );

  await prismaDmStatsNew.authorUser.createMany({
    data: authorUsers.map(({ id: _id, ...rest }) => rest),
  });

  await prismaDmStatsNew.issueSimple.createMany({
    data: await prismaDm.issue.findMany({
      distinct: ["issuecode", "userId"],
      select: {
        issuecode: true,
        userId: true,
      },
      where: {
        issuecode: {
          not: null,
        },
        userId: {
          in: userIdsWithPersoncodes,
        },
      },
    }),
  });

  console.log("Creating storyIssue entries");
  await prismaDmStatsNew.storyIssue.createMany({
    data: await prismaCoa.$queryRaw<
      (Pick<inducks_storyversion, "storycode"> &
        Pick<inducks_issue, "issuecode" | "oldestdate">)[]
    >`
      select distinct sv.storycode,
        i.issuecode,
        i.oldestdate
      from inducks_storyjob sj
        inner join inducks_storyversion sv using (storyversioncode)
        inner join inducks_entry e using (storyversioncode)
        inner join inducks_issue i using (issuecode)
      where sj.personcode in (${Prisma.join(personcodes)})
        and sv.storycode != ''`,
  });

  await prismaDmStatsNew.$executeRaw`OPTIMIZE TABLE histoires_publications`;

  console.log("Creating authorStory entries");
  await prismaDmStatsNew.authorStory.createMany({
    data: await prismaCoa.$queryRaw<
      (Pick<inducks_storyjob, "personcode"> &
        Pick<inducks_storyversion, "storycode">)[]
    >`
      select distinct sj.personcode, sv.storycode
      from inducks_storyjob sj
            inner join inducks_storyversion sv using (storyversioncode)
      where sv.storycode != ''
            and sv.what = 's'
            and sv.kind = 'n'
            and sj.personcode in (${Prisma.join(personcodes)})`,
  });

  await prismaDmStatsNew.$executeRaw`OPTIMIZE TABLE auteurs_histoires`;

  console.log("Creating missingStoryForUser entries");
  await prismaDmStatsNew.missingStoryForUser.createMany({
    data: await prismaDmStatsNew.$queryRaw<
      (Pick<authorUser, "userId"> &
        Pick<authorStory, "personcode" | "storycode">)[]
    >`
      select a_p.ID_User AS userId,
        a_h.personcode,
        a_h.storycode
      from auteurs_pseudos a_p
            inner join auteurs_histoires a_h on a_p.NomAuteurAbrege = a_h.personcode
            inner join histoires_publications h_pub using (storycode)
      where not exists(
                    select 1
                    from histoires_publications h_pub
                          inner join numeros_simple n using (issuecode)
                    where a_h.storycode = h_pub.storycode
                          and a_p.ID_User = n.ID_Utilisateur
            )
      group by a_p.ID_User,
            a_h.personcode,
            a_h.storycode`,
  });

  await prismaDmStatsNew.$executeRaw`OPTIMIZE TABLE utilisateurs_histoires_manquantes`;

  console.log("Creating missingIssueForUser entries");
  await prismaDmStatsNew.$executeRaw`
    insert into utilisateurs_publications_manquantes(ID_User, personcode, storycode, issuecode, oldestdate, Notation)
    select distinct u_h_m.ID_User AS userId,
      u_h_m.personcode,
      u_h_m.storycode,
      h_p.issuecode,
      h_p.oldestdate,
      a_p.Notation AS notation
    from utilisateurs_histoires_manquantes u_h_m
      inner join histoires_publications h_p using (storycode)
      inner join auteurs_pseudos a_p on a_p.ID_User = u_h_m.ID_User and u_h_m.personcode = a_p.NomAuteurAbrege`;

  await prismaDmStatsNew.$executeRaw`OPTIMIZE TABLE utilisateurs_publications_manquantes`;

  console.log("Creating suggestedIssueForUser entries");
  await prismaDmStatsNew.$executeRaw`
      insert into utilisateurs_publications_suggerees(ID_User, issuecode, oldestdate, Score)
      select ID_User AS userId, issuecode, oldestdate, sum(Notation) AS score
      from utilisateurs_publications_manquantes
      group by ID_User, issuecode, oldestdate`;

  await prismaDmStatsNew.$executeRaw`OPTIMIZE TABLE utilisateurs_publications_suggerees`;

  console.log("Adding publicationcode and issuenumber for WTD < 3");
  await db.runQuery(`
    UPDATE ${dbName}_new.utilisateurs_publications_suggerees
    JOIN coa.inducks_issue i using (issuecode)
    SET utilisateurs_publications_suggerees.publicationcode = i.publicationcode
      , utilisateurs_publications_suggerees.issuenumber     = i.issuenumber`);

  process.env.DATABASE_URL_DM_STATS = originalConnectionString;
  await db.runMigrations();

  await db.runQuery(`DROP DATABASE IF EXISTS ${dbName}_old`);
  await db.runQuery(`CREATE DATABASE ${dbName}_old`);

  for (const table of tables) {
    await db.runQuery(`RENAME TABLE
        ${dbName}.${table}     TO ${dbName}_old.${table},
        ${dbName}_new.${table} TO ${dbName}.${table}`);
  }

  await db.disconnect();
  process.exit(0);
});
