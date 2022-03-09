<template>
  <b-container align="center">
    <h3>{{ t('The game is about to start!') }}</h3>
    <b-row align-h="center">
      <b-card v-for="username in usernames" :key="username" class="player m-3 col-lg-3">
        <user-info :username="username" />
      </b-card>
    </b-row>
    <b-row align-h="center" class="mt-3">
      <b-col>
        {{
          t(
            'Waiting for other players... Send this link to your friends to invite them to this game:'
          )
        }}
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col>
        <b-row class="justify-content-center">
          <b-col cols="6">
            <input
              type="text"
              class="text-center"
              readonly
              :value="gameUrl"
              @click="$event.target.select()"
            />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'

const props = defineProps<{
  usernames: Array<string>
  gameId: number
}>()
const gameUrl = `${location.origin}/matchmaking/${props.gameId}`
const { t } = useI18n()
</script>

<style scoped lang="scss">
.card {
  cursor: pointer;
  color: black;

  &.player {
    .card {
      max-width: calc(50% - 30px);
    }
  }
}
input {
  color: gray;
  width: 100%;
}
</style>
