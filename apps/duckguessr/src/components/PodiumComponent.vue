<template>
  <div class="container-fluid">
    <h3 class="text-center mb-5">{{ t("Podium") }}</h3>
    <div
      v-if="topPlayers.length"
      class="d-flex flex-row justify-content-center"
    >
      <player-total-score
        v-for="(currentPlayer, index) in topPlayers"
        :key="currentPlayer.username"
        :current-player="currentPlayer"
        :max-score-all-players="maxPoints"
        top-player
        vertical
        :rank="index === 2 ? 2 : 1 - index"
      />
    </div>
    <b-row v-else align-h="center">
      <b-alert show variant="warning">
        {{ t("There aren't enough players to show the podium") }}
      </b-alert>
    </b-row>
    <div class="d-flex flex-column align-items-center m-5">
      <player-total-score
        v-for="(currentPlayer, idx) in otherPlayers"
        :key="currentPlayer.username"
        :current-player="currentPlayer"
        :top-player="false"
        :vertical="false"
        :rank="idx + 3"
        :max-score-all-players="maxPoints"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import type { player } from "~duckguessr-prisma-client";

const { t } = useI18n();
const { players } = defineProps<{
  players: (player & { sumScore: number })[];
}>();

const topPlayers = computed(() =>
  players.length >= 3 ? [players[1], players[0], players[2]] : [],
);

const maxPoints = computed(() =>
  topPlayers.value.reduce(
    (acc, currentPlayer) => Math.max(acc, currentPlayer.sumScore),
    0,
  ),
);

const otherPlayers = players.slice(3);
</script>
