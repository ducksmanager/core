import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";
import { readdirSync, readFileSync } from "fs";
import { getImageVector, preprocessImage } from ".";

const root = `${__dirname}/covers`;

const files = readdirSync(root, {
  recursive: true,
  withFileTypes: true,
});

const existingVectors = (
  await prismaCoa.$queryRaw<{ entryurl_id: number }[]>`
SELECT entryurl_id FROM inducks_entryurl_vector2
`
).map((v) => v.entryurl_id);

for (const file of files) {
  if (file.isDirectory() || !file.name.includes("fr_tp_")) {
    continue;
  }

  const relativePath = `${file.parentPath.replace(root + "/", "")}/${file.name}`;

  const entry = (
    await prismaCoa.$queryRaw<{ id: number }[]>`
        SELECT id from inducks_entryurl WHERE url = ${relativePath.replace("webusers/webusers", "webusers")}
    `
  )[0];

  if (!entry) {
    console.log(`Entry not found for ${relativePath}`);
    continue;
  }

  if (existingVectors.includes(entry.id)) {
    // console.log(`Vector already exists for ${relativePath}`);
    continue;
  }

  let vectorString;
  try {
    const imageBuffer = readFileSync(`${file.parentPath}/${file.name}`);
    const tensor = await preprocessImage(imageBuffer);
    const vector = await getImageVector(tensor);

    // Convert the vector to a string representation that MariaDB can understand
    // Format: [x1,x2,x3,...] where xi are floating point numbers
    vectorString = `[${vector.join(",")}]`;
  } catch (error) {
    console.error(`Error creating image vector for ${relativePath}`, error);
    continue;
  }

  prismaCoa.$executeRaw`
            INSERT INTO inducks_entryurl_vector2 (entryurl_id, v)
            VALUES (${entry.id}, VEC_FromText(${vectorString}))
        `
    .then(() => {
      console.log(`Added image vector for ${relativePath}`);
    })
    .catch((error) => {
      console.error(`Error adding image vector for ${relativePath}`, error);
    });
}
