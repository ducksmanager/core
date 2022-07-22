<template>
  <b-container align="center">
    <alert-not-connected v-if="isAnonymous === true" />
    <h3>{{ t('The game is about to start!') }}</h3>
    <b-row align-h="center">
      <b-card
        v-for="{ username, avatar, id } in players"
        :key="username"
        class="player m-3 col-lg-3"
      >
        <player-info
          :username="username"
          :avatar="avatar"
          :toggleable="isBot(username)"
          @toggle="$emit('remove-bot')"
        >
          <medal-list
            :with-details="false"
            :stats-override="getGamePlayerStats(id)"
            :cols="null"
            :cols-lg="null"
          />
        </player-info>
      </b-card>
      <b-card v-if="isMatchCreator && isBotAvailable && !isBotPlaying" class="player m-3 col-lg-3">
        <player-info username="potential_bot" toggleable @toggle="$emit('add-bot')" />
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
          <b-col cols="12" md="6" class="my-3">
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
    <b-button
      v-if="isMatchCreator"
      :disabled="players.length < 2"
      variant="success"
      @click="$emit('start-match')"
    >
      {{ t("Let's go!") }}
    </b-button>
  </b-container>
</template>

<script lang="ts">
import { computed, defineComponent, useMeta } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import Index from '@prisma/client'
import { getDuckguessrUsername } from '~/composables/user'
import { userStore } from '~/store/user'
import { UserMedalPoints } from '~/types/playerStats'

export default defineComponent({
  props: {
    players: { type: Array as () => Index.player[], required: true },
    gamePlayersStats: {
      type: Array as () => UserMedalPoints[],
      required: true,
    },
    gameId: { type: Number, required: true },
    isBotAvailable: { type: Boolean, required: true },
  },
  emits: ['start-match', 'add-bot', 'remove-bot'],
  setup(props) {
    const { t } = useI18n()
    // For some reason vue-i18n's interpolation doesn't work
    const title = computed(() =>
      t("Join {username}'s Duckguessr game!")
        .toString()
        .replace('{username}', props.players[0].username)
    )
    const gameUrl = computed(() => `${location.origin}/game/${props.gameId}`)
    const isMatchCreator = computed(() => getDuckguessrUsername() === props.players[0].username)
    const isBotPlaying = computed(() => props.players.find(({ username }) => isBot(username)))

    const isBot = (username: string) => /^bot_/.test(username)

    const isAnonymous = computed(() => userStore().isAnonymous)

    const getGamePlayerStats = (playerId: number) =>
      props.gamePlayersStats.filter(({ player_id }) => player_id === playerId)

    useMeta(() => ({
      title: title.value,
      meta: [
        {
          property: 'og:title',
          content: title.value,
        },
        {
          name: 'og:site_name',
          content: 'Duckguessr',
        },
        {
          property: 'og:description',
          content: title.value,
        },
        {
          property: 'og:url',
          content: gameUrl.value,
        },
        {
          property: 'og:image',
          content: `${location.origin}/favicon.png`,
        },
      ],
    }))

    return {
      gameUrl,
      isAnonymous,
      t,
      isMatchCreator,
      isBotPlaying,
      isBot,
      getGamePlayerStats,
    }
  },
  head: {},
})
</script>

<style scoped lang="scss">
.card {
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
