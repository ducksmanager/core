import type { Socket } from "socket.io";
import type { NamespaceProxyTarget } from "socket-call-server";
import { useSocketEvents } from "socket-call-server";

import { getGameWithRoundsDatasetPlayers, numberOfRounds } from "../game";
import game from "../game";
import { getPlayer, getPlayerStatistics, getUser } from "../get-player";
import { predict } from "../predict";
import prisma from "../prisma/client";
import type { player, round } from "../prisma/client_duckguessr/browser";
import { getRoundWithScores, setRoundTimes } from "../round";
import { guess } from "../round";
import type { GuessResponse } from "../types/guess";
import type { CurrentGame, SocketGameData } from "../types/socketEvents";
import namespaces from "./namespaces";

export type ClientListenEvents = {
  playerJoined: (player: player) => void;
  playerConnectedToMatch: () => void;
  playerLeft: (player: player) => void;
  matchStarts: () => void;
  gameEnds: () => void;
  playerGuessed: (guessResultsData: GuessResponse) => void;
  roundEnds: (round: round, nextRound?: Omit<round, "personcode">) => void;
  roundStarts: (round: Omit<round, "personcode">) => void;
  firstRoundWillStartSoon: (firstRoundStartDate: Date) => void;
};

export type GameServices = NamespaceProxyTarget<
  Socket<typeof listenEvents, ClientListenEvents, object, SocketGameData>,
  ClientListenEvents
>;

export type ClientEmitEvents = NonNullable<
  Awaited<ReturnType<typeof createGameSocket>>
>["client"]["emitEvents"];

const checkAndAssociatePlayer = async (
  currentGame: CurrentGame,
  player: player,
) => {
  if (currentGame.gamePlayers.find(({ playerId }) => playerId === player.id)) {
    console.info(
      `Player ${player.username} is already associated with game ${
        currentGame!.id
      }`,
    );
  } else {
    await game.associatePlayer(currentGame!.id, player);
    console.log(`${player.username} is ready in game ${currentGame!.id}`);
  }
  return player;
};

const onGuess = async (
  gameServices: GameServices,
  user: player,
  personcode: string | null,
): Promise<boolean> => {
  const { _socket, ...events } = gameServices;
  const currentRound = _socket.data.currentRound;
  console.log(
    `${user.username} is guessing ${JSON.stringify(personcode)} on round ${
      currentRound.id
    }`,
  );
  try {
    const guessResultsData =
      personcode &&
      (await guess(user, currentRound.id, {
        personcode,
      }));
    if (guessResultsData) {
      events.playerGuessed(guessResultsData);
      _socket.broadcast.emit("playerGuessed", {
        ...guessResultsData,
        answer: null,
      } as GuessResponse);

      if (personcode !== null) {
        const haveAllPlayersGuessed =
          (await getPlayersMissingRoundScore(_socket.data.currentRound))
            .length === 0;

        if (haveAllPlayersGuessed) {
          clearTimeout(_socket.data.currentRoundEndTimeout);
          await finishRound(gameServices);
          return true;
        }
      }
    }
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
};

const getPlayersMissingRoundScore = async (currentRound: round) =>
  await prisma.$queryRaw<player[]>`
      SELECT DISTINCT username
      FROM gamePlayer
             INNER JOIN player ON gamePlayer.playerId = player.id
      WHERE gamePlayer.gameId = ${currentRound.gameId}
        AND playerId NOT IN (SELECT playerId
                              FROM roundScore
                              WHERE roundId = ${currentRound.id})
      GROUP BY username
    `;

const startRound = (socket: GameServices) => {
  const { _socket, ...events } = socket;
  const currentRound = socket._socket.data.currentRound;
  _socket.data.currentRoundEndTimeout = setTimeout(
    () => finishRound(socket),
    currentRound.finishedAt!.getTime() - new Date().getTime(),
  );

  if (currentRound.roundNumber === 1) {
    setTimeout(() => {
      _socket.broadcast.emit(
        "firstRoundWillStartSoon",
        currentRound.startedAt!,
      );
      events.firstRoundWillStartSoon(currentRound.startedAt!);
    }, 200);
  }

  const { personcode, ...roundWithoutPersoncode } = currentRound;
  setTimeout(async () => {
    _socket.broadcast.emit("roundStarts", roundWithoutPersoncode);
    events.roundStarts(roundWithoutPersoncode);

    const botPlayer = (
      await prisma.gamePlayer.findFirst({
        where: {
          gameId: currentRound.gameId,
          player: {
            username: {
              startsWith: "bot",
            },
          },
        },
        include: {
          player: true,
        },
      })
    )?.player;
    if (botPlayer) {
      const possibleAuthors = _socket.data
        .currentGame!.rounds.filter(
          ({ roundNumber }: round) =>
            roundNumber === null || roundNumber >= currentRound.roundNumber!,
        )
        .map(({ personcode }: round) => personcode);
      predict(
        currentRound,
        _socket.data.currentGame!.dataset,
        possibleAuthors,
      ).then((personcode) => onGuess(socket, botPlayer, personcode));
    }
  }, currentRound.startedAt!.getTime() - new Date().getTime());
};

const finishRound = async (gameServices: GameServices) => {
  const { _socket, ...events } = gameServices;
  let { currentRound, currentGame } = _socket.data;
  console.log(`Round ${currentRound.id} finished`);
  const missingScores = await getPlayersMissingRoundScore(
    _socket.data.currentRound,
  );
  for (const { username } of missingScores) {
    console.log(`${username} is missing a score`);
    await onGuess(
      gameServices,
      (await prisma.player.findUnique({ where: { username } }))!,
      null,
    );
  }
  const roundWithScores = (await getRoundWithScores(currentRound.id))!;
  if (currentRound.roundNumber === numberOfRounds) {
    _socket.broadcast.emit("roundEnds", roundWithScores);
    events.roundEnds(roundWithScores);
    _socket.broadcast.emit("gameEnds");
    events.gameEnds();
  } else {
    currentRound = await setRoundTimes(
      currentGame!.rounds.find(
        ({ roundNumber }: round) =>
          roundNumber === currentRound.roundNumber! + 1,
      ) as round,
    );
    const { personcode, ...roundWithoutPersoncode } = currentRound;
    _socket.broadcast.emit(
      "roundEnds",
      roundWithScores,
      roundWithoutPersoncode,
    );
    events.roundEnds(roundWithScores, roundWithoutPersoncode);
    startRound(gameServices);
  }
};

const validateGameForBotAddOrRemove = (
  userId: number,
  currentGame: CurrentGame,
) => {
  if (
    currentGame.gamePlayers[0] &&
    userId !== currentGame.gamePlayers[0].playerId
  ) {
    console.error(
      "Only the player creating the match can add or remove a bot!",
    );
    return false;
  }
};

const removePlayer = async (
  user: player,
  _socket: GameServices["_socket"],
  playerLeftEvent: (player: player) => void,
) => {
  const { currentGame } = _socket.data;
  if (
    !currentGame.gamePlayers
      .map(({ player }) => player.username)
      .includes(user.username)
  ) {
    console.log(`${user.username} is not part of the game`);
  } else {
    await game.disassociatePlayer(currentGame!.id, user);

    _socket.broadcast.emit("playerLeft", user);
    playerLeftEvent(user);
  }
};

const listenEvents = ({ _socket, ...events }: GameServices) => ({
  removeBot: async () => {
    validateGameForBotAddOrRemove(
      _socket.data.user.id,
      _socket.data.currentGame,
    );
    await removePlayer(
      await getUser(`bot_${_socket.data.currentGame.dataset.name}`),
      _socket,
      events.playerLeft,
    );
    _socket.data.currentGame = (await getGameWithRoundsDatasetPlayers(
      _socket.data.gameId,
    ))!;
  },
  addBot: async () => {
    validateGameForBotAddOrRemove(
      _socket.data.user.id,
      _socket.data.currentGame,
    );

    const botUsername = `bot_${_socket.data.currentGame.dataset.name}`;
    const botPlayer = await getUser(botUsername);
    await checkAndAssociatePlayer(_socket.data.currentGame, botPlayer);
    _socket.data.currentGame = (await getGameWithRoundsDatasetPlayers(
      _socket.data.gameId,
    ))!;

    _socket.broadcast.emit("playerJoined", botPlayer);
    _socket.emit("playerJoined", botPlayer);
  },
  joinMatch: async () => {
    {
      const player = await checkAndAssociatePlayer(
        _socket.data.currentGame,
        _socket.data.user,
      );
      _socket.data.currentGame = (await getGameWithRoundsDatasetPlayers(
        _socket.data.gameId,
      ))!;

      events.playerJoined(player);

      const players = _socket.data.currentGame.gamePlayers.map(
        ({ player }) => player,
      );

      return {
        isBotAvailable: [
          "published-fr-recent",
          "published-fr-small",
          "it",
        ].includes(_socket.data.currentGame.dataset.name),
        players,
        playerStats: await getPlayerStatistics(players.map(({ id }) => id)),
      };
    }
  },
  startMatch: async () => {
    if (
      _socket.data.currentGame?.gamePlayers[0] &&
      _socket.data.user.id !== _socket.data.currentGame.gamePlayers[0].playerId
    ) {
      console.error(
        "The player starting the match must be the one who created it!",
      );
      return false;
    }

    console.log(`Game ${_socket.data.gameId} is starting!`);

    _socket.data.currentRound = await setRoundTimes(_socket.data.currentRound);
    startRound({ _socket, ...events });

    _socket.data.currentGame = (await getGameWithRoundsDatasetPlayers(
      _socket.data.gameId,
    ))!;

    _socket.broadcast.emit("matchStarts");
    events.matchStarts();
  },
  guess: async (personcode: string | null) => {
    const haveAllPlayersGuessed = await onGuess(
      { _socket, ...events },
      _socket.data.user,
      personcode,
    );
    if (haveAllPlayersGuessed) {
      return haveAllPlayersGuessed;
    }
  },
  disconnect: async ({ _socket }: GameServices, reason: string) => {
    if (reason !== "client namespace disconnect") {
      if (
        _socket.data.currentGame!.gamePlayers.findIndex(
          ({ player }) => player.id === _socket.data.user.id,
        ) > 0
      ) {
        await removePlayer(_socket.data.user, _socket, events.playerLeft);
        _socket.data.currentGame = (await getGameWithRoundsDatasetPlayers(
          _socket.data.gameId,
        ))!;
      }
    }
  },
});

export const createGameSocket = async (gameId: number) => {
  const currentGame = await getGameWithRoundsDatasetPlayers(gameId);
  if (!currentGame) {
    console.error(`Game not found for ID ${gameId}`);
    return;
  }

  return useSocketEvents<typeof listenEvents, ClientListenEvents>(
    namespaces.GAME.replace("{id}", gameId.toString()),
    {
      listenEvents,
      middlewares: [
        (
          { _socket, playerConnectedToMatch: playerConnectedToMatchEvent },
          next: (error?: Error) => void,
        ) => {
          getPlayer(_socket.handshake.auth.cookie).then((user) => {
            if (user) {
              _socket.data.user = user;
              _socket.data.currentGame = currentGame;
              playerConnectedToMatchEvent();
            } else {
              next(new Error("User not found"));
            }
          });
        },
      ],
    },
  );
};
