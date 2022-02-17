import Index, { PrismaClient } from '@prisma/client'
import { runQuery } from '../api/runQuery'

const prisma = new PrismaClient()
const numberOfRounds = 8

export const getGameWithRoundsDatasetPlayers = async (gameId: number) =>
  await prisma.game.findUnique({
    include: {
      rounds: true,
      dataset: true,
      game_players: true,
    },
    where: {
      id: gameId,
    },
  })

export async function createOrGetPending(gameType: Index.game['game_type'], datasetName: string) {
  const dataset = await prisma.dataset.findFirst({
    where: {
      name: datasetName,
    },
  })
  if (!dataset) {
    throw new Error(`Cannot find dataset with name ${datasetName}`)
  }
  const pendingGame = await prisma.game.findFirst({
    include: {
      game_players: true,
    },
    where: {
      game_type: gameType,
      dataset_id: dataset.id,
      rounds: {
        some: {
          started_at: null,
          round_number: 0,
        },
      },
    },
  })
  if (pendingGame) {
    return await getGameWithRoundsDatasetPlayers(pendingGame.id)
  }

  const roundDataResponse = (await prisma.$queryRaw`
    SELECT random_images.personcode, random_images.sitecode_url
    FROM (
      SELECT DISTINCT entryurl_details.personcode
      FROM entryurl_details
      INNER JOIN dataset_entryurl ON entryurl_details.sitecode_url = dataset_entryurl.sitecode_url
      WHERE dataset_id = ${dataset.id}
      ORDER BY RAND()
      LIMIT ${numberOfRounds + 1}
    ) AS random_authors
    INNER JOIN (
      SELECT DISTINCT entryurl_details.personcode, entryurl_details.sitecode_url
      FROM entryurl_details
      INNER JOIN dataset_entryurl ON entryurl_details.sitecode_url = dataset_entryurl.sitecode_url
      WHERE dataset_id = ${dataset.id}
      ORDER BY RAND()
    ) AS random_images ON random_authors.personcode = random_images.personcode
    GROUP BY random_images.personcode
    ORDER BY RAND()
    LIMIT ${numberOfRounds + 1}
  `) as { personcode: string; sitecode_url: string }[]

  if (roundDataResponse) {
    const rounds = roundDataResponse.map((roundData, roundNumber: number) => ({
      ...roundData,
      round_number: roundNumber === 0 ? null : roundNumber,
    }))
    const game = await prisma.game.create({
      data: {
        game_type: gameType,
        dataset_id: dataset.id,
        rounds: {
          create: rounds,
        },
      },
    })

    return await getGameWithRoundsDatasetPlayers(game.id)
  } else {
    throw new Error(`Couldn't find rounds for dataset ${dataset.id}`)
  }
}

export async function associatePlayer(gameId: number, player: Index.player) {
  await prisma.game_player.create({
    data: {
      game: {
        connect: { id: gameId },
      },
      player: {
        connect: { id: player.id },
      },
    },
  })
}

export async function getPlayer(username: string, password: string | null = null) {
  let user
  if (/^user[0-9]+$/.test(username) || /^bot_.+$/.test(username)) {
    user = await prisma.player.findFirst({
      where: {
        username,
      },
    })
    if (!user) {
      user = await prisma.player.create({
        data: {
          username,
        },
      })
    }
  } else {
    const [dmUser] = (
      await runQuery('SELECT ID AS id, username FROM users WHERE username=? AND password=?', 'dm', [
        username,
        password,
      ])
    ).data
    if (!dmUser) {
      throw new Error(`No DM user with username ${username}`)
    }
    user = await prisma.player.findFirst({
      where: {
        username,
      },
    })
    if (!user) {
      user = await prisma.player.create({
        data: {
          ducksmanager_id: parseInt(dmUser.id),
          username,
        },
      })
    }
  }

  return user
}
