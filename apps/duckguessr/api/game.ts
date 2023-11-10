import { player, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const numberOfRounds = 8;

export const getGameWithRoundsDatasetPlayers = async (gameId: number) =>
  await prisma.game.findUnique({
    include: {
      rounds: {
        include: {
          roundScores: true,
        },
      },
      dataset: true,
      gamePlayers: {
        include: {
          player: true,
        },
      },
    },
    where: {
      id: gameId,
    },
  });

export const create = async (datasetName: string) => {
  const dataset = await prisma.dataset.findFirst({
    where: {
      name: datasetName,
    },
  });
  if (!dataset) {
    throw new Error(`Cannot find dataset with name ${datasetName}`);
  }

  const roundDataResponse = (await prisma.$queryRaw`
    SELECT random_images.personcode, random_images.sitecodeUrl
    FROM (
      SELECT DISTINCT entryurlDetails.personcode
      FROM entryurlDetails
      INNER JOIN dataset_entryurl ON entryurlDetails.sitecodeUrl = dataset_entryurl.sitecodeUrl
      WHERE datasetId = ${dataset.id}
      ORDER BY RAND()
      LIMIT 100
    ) AS random_authors
    INNER JOIN (
      SELECT DISTINCT entryurlDetails.personcode, entryurlDetails.sitecodeUrl
      FROM entryurlDetails
      INNER JOIN dataset_entryurl ON entryurlDetails.sitecodeUrl = dataset_entryurl.sitecodeUrl
      WHERE datasetId = ${dataset.id}
      AND decision = 'ok'
      ORDER BY RAND()
    ) AS random_images ON random_authors.personcode = random_images.personcode
    GROUP BY random_images.personcode
    ORDER BY RAND()
    LIMIT ${numberOfRounds + 1}
  `) as { personcode: string; sitecodeUrl: string }[];

  if (roundDataResponse) {
    const rounds = roundDataResponse.map((roundData, roundNumber: number) => ({
      ...roundData,
      roundNumber: roundNumber === 0 ? null : roundNumber,
    }));
    const game = await prisma.game.create({
      data: {
        datasetId: dataset.id,
        rounds: {
          create: rounds,
        },
      },
    });

    return await getGameWithRoundsDatasetPlayers(game.id);
  } else {
    throw new Error(`Couldn't find rounds for dataset ${dataset.id}`);
  }
};

export const associatePlayer = async (gameId: number, player: player) => {
  await prisma.gamePlayer.create({
    data: {
      game: {
        connect: { id: gameId },
      },
      player: {
        connect: { id: player.id },
      },
    },
  });
};

export const disassociatePlayer = async (gameId: number, player: player) => {
  await prisma.gamePlayer.deleteMany({
    where: {
      gameId,
      player,
    },
  });
};

export default {
  associatePlayer,
  create,
  disassociatePlayer,
};
