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
import { MatchDetails } from "~types/matchDetails";
import { userStore } from "~/stores/user";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "~types/socketEvents";
import { UserMedalPoints } from "~types/playerStats";
import { player } from "~duckguessr-api/types/prisma-client";

const players = ref([] as player[]);
const gamePlayersStats = ref(null as UserMedalPoints[] | null);
const isBotAvailableForGame = ref(null as Boolean | null);

const { gameId, gameSocket } = toRefs(
  defineProps<{
    gameId: number;
    gameSocket: Socket<ServerToClientEvents, ClientToServerEvents>;
  }>()
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
    ({ username }) => username !== player.username
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
              for (const player of players) {
                addPlayer(player);
              }
            }
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
  { immediate: true }
);
</script>
