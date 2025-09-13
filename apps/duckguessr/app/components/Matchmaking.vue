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
import type { MatchDetails } from "~duckguessr-types/matchDetails";
import { userStore } from "~/stores/user";
import type { player, userMedalPoints } from "~duckguessr-prisma-client";

const players = ref([] as player[]);
const gamePlayersStats = ref(null as userMedalPoints[] | null);
const isBotAvailableForGame = ref(null as boolean | null);

const { gameId, gameSocket } = defineProps<{
  gameId: number;
  gameSocket: ReturnType<typeof useDuckguessrSocket>["gameSocket"];
}>();

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
  gameSocket.value!.startMatch();
};

const addBot = () => {
  gameSocket.value!.addBot();
};

const removeBot = () => {
  gameSocket.value!.removeBot();
};

watch(
  () => userStore().user,
  (value) => {
    if (value) {
      gameSocket.value!.playerConnectedToMatch = () => {
        gameSocket
          .value!.joinMatch()
          .then(({ players, isBotAvailable, playerStats }: MatchDetails) => {
            isBotAvailableForGame.value = isBotAvailable;
            gamePlayersStats.value = playerStats;
            for (const currentPlayer of players) {
              addPlayer(currentPlayer);
            }
          });
      };
      gameSocket.value!.playerJoined = (player: player) => {
        console.debug(`${player.username} is also ready`);
        addPlayer(player);
      };
      gameSocket.value!.playerLeft = (player: player) => {
        console.debug(`${player.username} has left`);
        removePlayer(player);
      };
      gameSocket.value!.matchStarts = () => {
        console.debug(`Match starts on game ${gameId}`);
        emit("start-match");
      };
    }
  },
  { immediate: true },
);
</script>
