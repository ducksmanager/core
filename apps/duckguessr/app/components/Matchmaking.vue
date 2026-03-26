<template>
  <game-table
    v-if="game"
    :game="game"
    :current-round-number="null"
    :round-scores="[]"
    @guess="gameSocket.guess"
  />
  <waiting-for-players
    v-if="players.length"
    :players="players"
    :game-players-stats="gamePlayersStats!"
    :game-id="game.id"
    :is-bot-available="isBotAvailableForGame === true"
    @start-match="startMatch"
    @add-bot="addBot"
    @remove-bot="removeBot"
  />
</template>

<script lang="ts" setup>
import { playerStore } from "~/stores/player";
import type { player, userMedalPoints } from "~duckguessr-prisma-browser";
import type { GameFullNoPersoncode } from "~duckguessr-types/game";

const players = ref<player[]>([]);
const gamePlayersStats = ref<userMedalPoints[]>();
const isBotAvailableForGame = ref<boolean>();

const { game } = defineProps<{
  game: GameFullNoPersoncode;
}>();

const { getGameSocketFromId } = inject(duckguessrSocketInjectionKey)!;
const gameSocket = getGameSocketFromId(game.id);

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
  () => playerStore().playerUser,
  (value) => {
    if (value) {
      gameSocket.sendGame = () => {
        gameSocket
          .joinMatch()
          .then(({ players, isBotAvailable, playerStats }) => {
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
        console.debug(`Match starts on game ${game.id}`);
        emit("start-match");
      };
    }
  },
  { immediate: true },
);
</script>
