<template>
  <div class="container-fluid">
    <h3 class="text-center mb-5">{{ t('Podium') }}</h3>
    <div v-if="topPlayers.length" class="d-flex flex-row justify-content-center">
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
    <div class="d-flex flex-row justify-content-center m-5">
      <player-total-score
        v-for="player in otherPlayers"
        :key="player.username"
        :player="player"
        :top-player="false"
        :vertical="false"
        :max-score-all-players="maxPoints"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from 'nuxt-i18n-composable'
import { PlayerWithSumScore } from '~/types/playerStats'

const { t } = useI18n()
const props = defineProps<{
  players: PlayerWithSumScore[]
}>()

const topPlayers =
  props.players.length >= 3 ? [props.players[1], props.players[0], props.players[2]] : []

const maxPoints = topPlayers.reduce((acc, player) => Math.max(acc, player.sum_score), 0)

const otherPlayers = props.players.slice(3)
</script>
