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
import { playerStore } from "~/stores/player";
import type { player, userMedalPoints } from "~duckguessr-prisma-browser";

const players = ref([] as player[]);
const gamePlayersStats = ref(null as userMedalPoints[] | null);
const isBotAvailableForGame = ref(null as boolean | null);

const { gameId } = defineProps<{
  gameId: number;
}>();

const { getGameSocketFromId } = inject(duckguessrSocketInjectionKey)!;
const gameSocket = getGameSocketFromId(gameId);

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
  gameSocket.startMatch();
};

const addBot = () => {
  gameSocket.addBot();
};

const removeBot = () => {
  gameSocket.removeBot();
};

watch(
  () => playerStore().user,
  (value) => {
    if (value) {
      gameSocket.playerConnectedToMatch = () => {
        gameSocket
          .joinMatch()
          .then(({ players, isBotAvailable, playerStats }: MatchDetails) => {
            isBotAvailableForGame.value = isBotAvailable;
            gamePlayersStats.value = playerStats;
            for (const currentPlayer of players) {
              addPlayer(currentPlayer);
            }
          });
      };
      gameSocket.playerJoined = (player: player) => {
        console.debug(`${player.username} is also ready`);
        addPlayer(player);
      };
      gameSocket.playerLeft = (player: player) => {
        console.debug(`${player.username} has left`);
        removePlayer(player);
      };
      gameSocket.matchStarts = () => {
        console.debug(`Match starts on game ${gameId}`);
        emit("start-match");
      };
    }
  },
  { immediate: true },
);
</script>
