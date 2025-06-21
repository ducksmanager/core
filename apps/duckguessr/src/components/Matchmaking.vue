<template>
  <waiting-for-players
    v-if="players.length"
    :players="players"
    :game-players-stats="gamePlayersStats!"
    :game-id="gameId"
    :is-bot-available="isBotAvailableForGame === true"
    @start-match="startMatch"
    @add-bot="addBot"
    @remove-bot="removeBot"
  />
</template>

<script lang="ts" setup>
import { Socket } from "socket.io-client";
import { MatchDetails } from "~duckguessr-types/matchDetails";
import { userStore } from "~/stores/user";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "~duckguessr-types/socketEvents";
import { player, userMedalPoints } from "~duckguessr-prisma-client";

const players = ref([] as player[]);
const gamePlayersStats = ref(null as userMedalPoints[] | null);
const isBotAvailableForGame = ref(null as boolean | null);

const { gameId, gameSocket } =
  toRefs(
    defineProps<{
      gameId: number;
      gameSocket: Socket<ServerToClientEvents, ClientToServerEvents>;
    }>(),
  );

const emit = defineEmits<{
  (e: "start-match"): void;
}>();

const addPlayer = (player: player) => {
  if (!players.value.find(({ username }) => username === player.username)) {
    players.value.push(player);
  }
};

const removePlayer = (player: player) => {
  players.value = players.value.filter(
    ({ username }) => username !== player.username,
  );
};

const startMatch = () => {
  gameSocket.value.emit("startMatch");
};

const addBot = () => {
  gameSocket.value.emit("addBot");
};

const removeBot = () => {
  gameSocket.value.emit("removeBot");
};

watch(
  () => userStore().user,
  (value) => {
    if (value) {
      gameSocket.value
        .on("playerConnectedToMatch", () => {
          gameSocket.value.emit(
            "joinMatch",
            ({ players, isBotAvailable, playerStats }: MatchDetails) => {
              isBotAvailableForGame.value = isBotAvailable;
              gamePlayersStats.value = playerStats;
              for (const currentPlayer of players) {
                addPlayer(currentPlayer);
              }
            },
          );
        })
        .on("playerJoined", (player: player) => {
          console.debug(`${player.username} is also ready`);
          addPlayer(player);
        })
        .on("playerLeft", (player: player) => {
          console.debug(`${player.username} has left`);
          removePlayer(player);
        })
        .on("matchStarts", () => {
          console.debug(`Match starts on game ${gameId}`);
          emit("start-match");
        });
    }
  },
  { immediate: true },
);
</script>
