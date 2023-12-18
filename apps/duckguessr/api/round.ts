import { player, PrismaClient, round, roundScore } from "./prisma/client_duckguessr";

import { GuessRequest, GuessResponse } from "./types/guess";
const prisma = new PrismaClient();

const gameKickoffTime = 10000;
const kickoffTime = 5000;
const roundTime = 10000;

export const getRoundWithScores = async (roundId: number) =>
  await prisma.round.findFirst({
    include: {
      roundScores: true,
    },
    where: {
      id: roundId,
    },
  });

export const setRoundTimes = async (round: round) => {
  const offset = new Date(
    new Date().getTime() +
    (round.roundNumber === 1 ? gameKickoffTime : kickoffTime)
  ).getTime();
  return await prisma.round.update({
    where: {
      id: round.id,
    },
    include: {
      roundScores: true,
    },
    data: {
      startedAt: new Date(offset),
      finishedAt: new Date(offset + roundTime),
    },
  });
};

export const guess = async (
  player: player,
  roundId: number,
  { personcode }: GuessRequest
) => {
  const thisRound = (await getRoundWithScores(roundId))!;
  if (
    await prisma.roundScore.findFirst({
      where: {
        playerId: player.id,
        roundId: thisRound.id,
      },
    })
  ) {
    console.error(
      `Player ${player.username} already guessed round ${thisRound.id}`
    );
    return;
  }

  let roundScore: Pick<roundScore, "playerId" | "roundId"> = {
    playerId: player.id,
    roundId: thisRound.id,
  };

  if (personcode === thisRound.personcode) {
    const timeSpentGuessing = Date.now() - thisRound.startedAt!.getTime();
    const speedBonus =
      timeSpentGuessing < roundTime / 2
        ? Number((100 - timeSpentGuessing * (100 / (roundTime / 2))).toFixed(0))
        : 0;
    roundScore = {
      ...roundScore,
      scoreTypeName: "Correct author",
      score: 100,
      timeSpentGuessing,
      speedBonus,
    };
  } else {
    roundScore = {
      ...roundScore,
      scoreTypeName: "Wrong author",
      score: 0,
    };
  }

  await prisma.roundScore.create({ data: roundScore });

  return {
    roundScore,
    answer: thisRound.personcode,
  } as GuessResponse;
};
