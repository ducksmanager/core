import { player, PrismaClient, round } from "@prisma/client";
import { Server, Socket } from "socket.io";

import { getGameWithRoundsDatasetPlayers, numberOfRounds } from "../game";
import game from "../game";
import { getPlayer, getPlayerStatistics, getUser } from "../get-player";
import { predict } from "../predict";
import { getRoundWithScores, setRoundTimes } from "../round";
import { guess } from "../round";
import { GuessResponse } from "../types/guess";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../types/socketEvents";

const prisma = new PrismaClient();

export const createMatchmakingSocket = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  io.of("/match").on("connection", async (socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie);
    if (!user) {
      console.log(
        `Can't find user for cookie ${JSON.stringify(
          socket.handshake.auth.cookie
        )}`
      );
      return false;
    }

    socket.on("createMatch", async (dataset, callback) => {
      console.log(`${user.username} is creating a match`);
      const newGame = (await game.create(dataset))!;
      await createGameSocket(io, newGame.id);
      callback(newGame.id);
    });
  });
};

export const createGameSocket = async (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  gameId: number
) => {
  let currentGame = await getGameWithRoundsDatasetPlayers(gameId);
  if (!currentGame) {
    console.error(`Game not found for ID ${gameId}`);
    return;
  }
  let currentRound: round = currentGame.rounds.find(
    ({ roundNumber }: round) => roundNumber === 1
  ) as round;
  let currentRoundEndTimeout: NodeJS.Timeout;

  const checkAndAssociatePlayer = async (player: player) => {
    if (
      currentGame!.gamePlayers.find(({ playerId }) => playerId === player.id)
    ) {
      console.info(
        `Player ${player.username} is already associated with game ${
          currentGame!.id
        }`
      );
    } else {
      await game.associatePlayer(currentGame!.id, player);
      console.log(`${player.username} is ready in game ${currentGame!.id}`);
    }
    return player;
  };

  const onGuess = async (
    socket: Socket,
    user: player,
    personcode: string | null
  ): Promise<boolean> => {
    console.log(
      `${user.username} is guessing ${JSON.stringify(personcode)} on round ${
        currentRound.id
      }`
    );
    try {
      const guessResultsData =
        personcode &&
        (await guess(user, currentRound.id, {
          personcode,
        }));
      if (guessResultsData) {
        socket.emit("playerGuessed", guessResultsData);
        socket.broadcast.emit("playerGuessed", {
          ...guessResultsData,
          answer: null,
        } as GuessResponse);

        if (personcode !== null) {
          const haveAllPlayersGuessed =
            (await getPlayersMissingRoundScore()).length === 0;

          if (haveAllPlayersGuessed) {
            clearTimeout(currentRoundEndTimeout);
            await finishRound(socket);
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

  const getPlayersMissingRoundScore = async (): Promise<player[]> =>
    await prisma.$queryRaw`
        SELECT DISTINCT username
        FROM gamePlayer
               INNER JOIN player ON gamePlayer.playerId = player.id
        WHERE gamePlayer.gameId = ${currentRound.gameId}
          AND playerId NOT IN (SELECT playerId
                                FROM roundScore
                                WHERE roundId = ${currentRound.id})
        GROUP BY username
      `;

  const startRound = (socket: Socket) => {
    currentRoundEndTimeout = setTimeout(
      () => finishRound(socket),
      currentRound.finishedAt!.getTime() - new Date().getTime()
    );

    if (currentRound.roundNumber === 1) {
      setTimeout(() => {
        socket.broadcast.emit(
          "firstRoundWillStartSoon",
          currentRound.startedAt!
        );
        socket.emit("firstRoundWillStartSoon", currentRound.startedAt!);
      }, 200);
    }

    setTimeout(async () => {
      socket.broadcast.emit("roundStarts", {
        ...currentRound,
        personcode: null,
      });
      socket.emit("roundStarts", { ...currentRound, personcode: null });

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
        const possibleAuthors = currentGame!.rounds
          .filter(
            ({ roundNumber }: round) =>
              roundNumber === null || roundNumber >= currentRound.roundNumber!
          )
          .map(({ personcode }: round) => personcode);
        predict(currentRound, currentGame!.dataset, possibleAuthors).then(
          (personcode) => onGuess(socket, botPlayer!, personcode)
        );
      }
    }, currentRound.startedAt!.getTime() - new Date().getTime());
  };

  const finishRound = async (socket: Socket) => {
    console.log(`Round ${currentRound.id} finished`);
    const missingScores = await getPlayersMissingRoundScore();
    for (const { username } of missingScores) {
      console.log(`${username} is missing a score`);
      await onGuess(
        socket,
        (await prisma.player.findUnique({ where: { username } }))!,
        null
      );
    }
    const roundWithScores = await getRoundWithScores(currentRound.id);
    socket.broadcast.emit("roundEnds", roundWithScores, null);
    socket.emit("roundEnds", roundWithScores, null);
    if (currentRound.roundNumber === numberOfRounds) {
      socket.broadcast.emit("gameEnds");
      socket.emit("gameEnds");
    } else {
      currentRound = await setRoundTimes(
        currentGame!.rounds.find(
          ({ roundNumber }: round) =>
            roundNumber === currentRound.roundNumber! + 1
        ) as round
      );
      socket.broadcast.emit("roundEnds", roundWithScores, {
        ...currentRound,
        personcode: null,
      });
      socket.emit("roundEnds", roundWithScores, {
        ...currentRound,
        personcode: null,
      });
      startRound(socket);
    }
  };

  io.of(`/game/${gameId}`).on("connection", async (socket) => {
    const user = await getPlayer(socket.handshake.auth.cookie);
    if (!user) {
      console.log(
        `Can't find user for cookie ${JSON.stringify(
          socket.handshake.auth.cookie
        )}`
      );
      return false;
    }

    const validateGameForBotAddOrRemove = () => {
      if (user!.id !== currentGame!.gamePlayers[0].playerId) {
        console.error(
          "Only the player creating the match can add or remove a bot!"
        );
        return false;
      }
    };

    const removePlayer = async (user: player) => {
      if (
        !currentGame!.gamePlayers
          .map(({ player }) => player.username)
          .includes(user.username)
      ) {
        console.log(`${user.username} is not part of the game`);
      } else {
        await game.disassociatePlayer(gameId, user);

        socket.broadcast.emit("playerLeft", user);
        socket.emit("playerLeft", user);
      }
    };

    socket.emit("playerConnectedToMatch");

    socket.on("removeBot", async () => {
      validateGameForBotAddOrRemove();
      await removePlayer(await getUser(`bot_${currentGame!.dataset.name}`));
      currentGame = await getGameWithRoundsDatasetPlayers(gameId);
    });

    socket.on("addBot", async () => {
      validateGameForBotAddOrRemove();

      const botUsername = `bot_${currentGame!.dataset.name}`;
      const botPlayer = await getUser(botUsername);
      await checkAndAssociatePlayer(botPlayer);
      currentGame = await getGameWithRoundsDatasetPlayers(gameId);

      socket.broadcast.emit("playerJoined", botPlayer);
      socket.emit("playerJoined", botPlayer);
    });

    socket.on("joinMatch", async (callback) => {
      const player = await checkAndAssociatePlayer(user);
      currentGame = (await getGameWithRoundsDatasetPlayers(gameId))!;

      socket.broadcast.emit("playerJoined", player);

      const players = currentGame.gamePlayers.map(({ player }) => player);

      callback({
        isBotAvailable: [
          "published-fr-recent",
          "published-fr-small",
          "it",
        ].includes(currentGame.dataset.name),
        players,
        playerStats: await getPlayerStatistics(players.map(({ id }) => id)),
      });
    });

    socket.on("startMatch", async () => {
      if (user.id !== currentGame!.gamePlayers[0].playerId) {
        console.error(
          "The player starting the match must be the one who created it!"
        );
        return false;
      }

      console.log(`Game ${gameId} is starting!`);

      currentRound = await setRoundTimes(currentRound);
      startRound(socket);

      currentGame = await getGameWithRoundsDatasetPlayers(gameId);

      socket.broadcast.emit("matchStarts");
      socket.emit("matchStarts");
    });

    socket.on("guess", async (personcode, callback) => {
      const haveAllPlayersGuessed = await onGuess(socket, user!, personcode);
      if (haveAllPlayersGuessed) {
        callback(haveAllPlayersGuessed);
      }
    });

    socket.on("disconnect", async (reason: string) => {
      if (reason !== "client namespace disconnect") {
        if (
          currentGame!.gamePlayers.findIndex(
            ({ player }) => player.id === user.id
          ) > 0
        ) {
          await removePlayer(user);
          currentGame = await getGameWithRoundsDatasetPlayers(gameId);
        }
      }
    });
  });
};
