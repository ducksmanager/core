<template>
  <div class="container-fluid">
    <h3 class="text-center mb-5">{{ t("Podium") }}</h3>
    <div
      v-if="topPlayers.length"
      class="d-flex flex-row justify-content-center"
    >
      <player-total-score
        v-for="(player, index) in topPlayers"
        :key="player.username"
        :player="player"
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
        v-for="(player, idx) in otherPlayers"
        :key="player.username"
        :player="player"
        :top-player="false"
        :vertical="false"
        :rank="idx + 3"
        :max-score-all-players="maxPoints"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { player } from "~duckguessr-api/types/prisma-client";

const { t } = useI18n();
const { players } = toRefs(
  defineProps<{
    players: (player & { sumScore: number })[];
  }>()
);

const topPlayers = computed(() =>
  players.value.length >= 3
    ? [players.value[1], players.value[0], players.value[2]]
    : []
);

const maxPoints = computed(() =>
  topPlayers.value.reduce((acc, player) => Math.max(acc, player.sumScore), 0)
);

const otherPlayers = players.value.slice(3);
</script>
