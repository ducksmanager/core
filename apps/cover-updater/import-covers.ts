import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { prismaClient as prismaCoverInfo } from "~prisma-schemas/schemas/cover_info/client";

import { chunk } from "./util";

const INSERT_CHUNK_SIZE = 5000;

type CoaCover = { issuecode: string; sitecode: string; url: string };

// One cover per issue: the URLs of the entry sorted first within its issue.
const fetchCoaCovers = () =>
  prismaCoa.$queryRaw<CoaCover[]>`
    SELECT DISTINCT entry.issuecode, entryurl.sitecode, entryurl.url
    FROM inducks_entry entry
      INNER JOIN inducks_entryurl entryurl
        ON entryurl.entrycode = entry.entrycode
    WHERE entry.issuecode != ''
      AND entryurl.sitecode NOT LIKE 'thumbnails%'
      AND entryurl.url IS NOT NULL
      AND entry.position = (
        SELECT MIN(sibling.position)
        FROM inducks_entry sibling
        WHERE sibling.issuecode = entry.issuecode
      )`;

export const importCovers = async () => {
  console.log("Exporting covers from the COA database...");
  const coaCovers = await fetchCoaCovers();

  console.log(
    `Importing ${coaCovers.length} covers into the covers database...`,
  );
  let importedCount = 0;
  for (const covers of chunk(coaCovers, INSERT_CHUNK_SIZE)) {
    const { count } = await prismaCoverInfo.cover.createMany({
      data: covers,
      skipDuplicates: true,
    });
    importedCount += count;
  }

  console.log(`Imported ${importedCount} new covers`);
};
