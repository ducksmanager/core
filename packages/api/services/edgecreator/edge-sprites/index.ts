import { v2 as cloudinaryV2 } from "cloudinary";
import type { Socket } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-clients/schemas/coa/client";
import type { edge } from "~prisma-clients/schemas/dm";
import { prismaClient as prismaDm } from "~prisma-clients/schemas/dm/client";

import type Events from "../types";
const SPRITE_SIZES = [10, 20, 50, 100, "full"];
const MAX_SPRITE_SIZE = 100;

export default (socket: Socket<Events>) => {
  socket.on("uploadEdges", async (callback) => {
    try {
      let nextCursor = undefined;
      let allCloudinarySlugs: string[] = [];
      while (true) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: any = await cloudinaryV2.search
          .expression("public_id=edges-*")
          .max_results(500)
          .next_cursor(nextCursor)
          .execute();

        console.log(`Rate limit remaining: ${results.rate_limit_remaining}`);

        allCloudinarySlugs = [
          ...allCloudinarySlugs,
          ...results.resources.map(
            (edge: { public_id: string }) => edge.public_id,
          ),
        ];
        nextCursor = results.next_cursor;
        if (!nextCursor) {
          break;
        }
      }

      const edgesNotInCloudinary = await prismaDm.edge.findMany({
        where: {
          slug: {
            notIn: allCloudinarySlugs,
          },
        },
      });

      const coaEdgesNotInCloudinary = (await prismaCoa.inducks_issue.findMany({
        where: {
          issuecode: {
            in: edgesNotInCloudinary.map(({ issuecode }) => issuecode),
          }
        },
      })).groupBy("issuecode");

      for (const {id, slug, issuecode} of edgesNotInCloudinary) {

      const { publicationcode, issuenumber } = coaEdgesNotInCloudinary[issuecode]!;
      const [countrycode, magazinecode] = publicationcode.split('/')


        console.log(
          `Uploading edge with ID ${id} and slug ${slug}...`,
        );
        await cloudinaryV2.uploader.upload(
          `${process.env.VITE_EDGES_ROOT}${countrycode}/gen/${magazinecode}.${issuenumber}.png`,
          {
            public_id: slug!,
          },
        );
      }
      callback();
    } catch (e) {
      console.error(e);
    }

    const edgeIdsWithSprites = (
      await prismaDm.edgeSprite.findMany({
        select: { edgeId: true },
      })
    ).map(({ edgeId }) => edgeId);

    const edgesWithoutSprites = await prismaDm.edge.findMany({
      where: {
        id: {
          notIn: edgeIdsWithSprites,
        },
      },
    });

    console.log(
      `Edges without sprites: ${JSON.stringify(
        edgesWithoutSprites.map(({ slug }) => slug),
      )}`,
    );

    await updateTags(edgesWithoutSprites);
    await generateSprites();
  });
};

const getSpriteName = (publicationcode: string, suffix: string) =>
  `edges-${publicationcode.replace("/", "-")}-${suffix}`;

const getSpriteRange = (issuenumber: string, rangeWidth: number) => {
  const issueNumberAsNumber = isNaN(parseInt(issuenumber))
    ? 0
    : parseInt(issuenumber);
  return [
    issueNumberAsNumber - ((issueNumberAsNumber - 1) % rangeWidth),
    issueNumberAsNumber -
    ((issueNumberAsNumber - 1) % rangeWidth) +
    rangeWidth -
    1,
  ].join("-");
};

interface Tag {
  slugs: string[];
  spriteSize: number;
}

const updateTags = async (edges: edge[]) => {
  await prismaDm.edgeSprite.deleteMany({
    where: {
      id: {
        in: edges.map(({ id }) => id),
      },
    },
  });

  const edgeIssues = (await prismaCoa.inducks_issue.findMany({
    select: {
      issuenumber: true,
      publicationcode: true,
      issuecode: true,
    },
    where: {
      issuecode: {
        in: edges.map(({ issuecode }) => issuecode),
      },
    },
  })).groupBy("issuecode");

  const tagsToAdd: { [spriteName: string]: Tag } = {};
  const insertOperations = [];

  for (const edge of edges) {
    const {publicationcode, issuenumber} = edgeIssues[edge.issuecode]!;
    for (const spriteSize of SPRITE_SIZES) {
      const spriteName = getSpriteName(
        publicationcode,
        spriteSize === "full"
          ? "full"
          : getSpriteRange(issuenumber, spriteSize as number),
      );

      let actualSpriteSize;
      if (spriteSize === "full") {
        actualSpriteSize = await prismaDm.edge.count({
          where: { publicationcode },
        });
        if (actualSpriteSize > MAX_SPRITE_SIZE) {
          console.log(
            `Not creating a full sprite for publication ${publicationcode} : sprite size is too big (${spriteSize})`,
          );
          continue;
        }
      } else {
        actualSpriteSize =
          (await prismaDm.edgeSprite.count({
            where: { spriteName },
          })) + 1;
      }
      console.log(`Adding tag ${spriteName} on ${edge.slug}`);
      if (!tagsToAdd[spriteName]) {
        tagsToAdd[spriteName] = { slugs: [], spriteSize: actualSpriteSize };
      }
      tagsToAdd[spriteName].slugs.push(edge.slug!);
      insertOperations.push(
        prismaDm.edgeSprite.create({
          data: {
            edgeId: edge.id,
            spriteName,
            spriteSize: actualSpriteSize,
          },
        }),
      );
    }
  }
  await prismaDm.$transaction(insertOperations);

  const updateOperations = [];
  for (const [spriteName, { slugs, spriteSize }] of Object.entries(tagsToAdd)) {
    await cloudinaryV2.uploader.add_tag(spriteName, slugs);

    updateOperations.push(
      prismaDm.edgeSprite.updateMany({
        data: { spriteSize },
        where: { spriteName },
      }),
    );
  }
  await prismaDm.$transaction(updateOperations);
};

const generateSprites = async () => {
  const spritesWithNoUrl = (
    await prismaDm.$queryRaw<{ spriteName: string }[]>`
      select distinct Sprite_name AS spriteName
      from tranches_pretes_sprites
      where Sprite_name not in (select sprite_name from tranches_pretes_sprites_urls)
        and Sprite_size < 100
    `
  ).map(({ spriteName }) => spriteName);

  const insertOperations = [];
  for (const spriteName of spritesWithNoUrl) {
    try {
      const { version } =
        await cloudinaryV2.uploader.generate_sprite(spriteName);
      insertOperations.push(
        prismaDm.edgeSpriteUrl.create({
          data: {
            version: String(version),
            spriteName,
          },
        }),
      );
    } catch (err: unknown) {
      console.error(err);
    }
  }
  await prismaDm.$transaction(insertOperations);
};
