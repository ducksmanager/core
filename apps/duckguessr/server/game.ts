import Index, { PrismaClient } from '@prisma/client'
import { runQuery } from '../api/runQuery'

const prisma = new PrismaClient()
const numberOfRounds = 8

export async function createOrGetPending(
  gameType: Index.game['game_type'],
  datasetName: string
) {
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
    return { gameId: pendingGame.id, created: false }
  }

  const roundDataResponse = (await prisma.$queryRaw`
    SELECT dataset_entryurl.personcode, sitecode_url
    FROM dataset_entryurl
    INNER JOIN (
      SELECT DISTINCT personcode
      FROM dataset_entryurl
      WHERE dataset_id = 1
      ORDER BY RAND()
    ) random_authors ON random_authors.personcode = dataset_entryurl.personcode
    WHERE dataset_id = 1
    GROUP BY dataset_entryurl.personcode
    ORDER BY RAND()
    LIMIT ${numberOfRounds + 1}
  `) as { personcode: string; sitecode_url: string }[]

  if (roundDataResponse) {
    const rounds = roundDataResponse
      .map(
        (
          // eslint-disable-next-line camelcase
          roundData,
          roundNumber: number
        ) => ({
          ...roundData,
          round_number: roundNumber + 1,
        })
      )
      .filter(
        // eslint-disable-next-line camelcase
        ({ round_number: roundNumber }: { round_number: number }) =>
          roundNumber <= numberOfRounds
      )
    const game = await prisma.game.create({
      data: {
        game_type: gameType,
        rounds: {
          create: rounds,
        },
      },
    })

    return { gameId: game.id, created: true }
  } else {
    throw new Error(`Couldn't find rounds for dataset ${dataset.id}`)
  }
}

export async function associatePlayer(
  gameId: number,
  username: string,
  password: string | null = null
) {
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
      await runQuery(
        'SELECT ID AS id, username from users where username=? AND password=?',
        'dm',
        [username, password]
      )
    ).data
    if (!dmUser) {
      console.error(`No DM user with username ${username}`)
      return null
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
  const userId = user.id
  await prisma.game_player.create({
    data: {
      game_id: gameId,
      player_id: userId,
    },
  })

  return user
}
