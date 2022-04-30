<template>
  <b-container align="center">
    <h3>{{ t('The game is about to start!') }}</h3>
    <b-row align-h="center">
      <b-card v-for="username in usernames" :key="username" class="player m-3 col-lg-3">
        <player-info :username="username" />
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
  </b-container>
</template>

<script lang="ts">
import { computed, defineComponent, useMeta } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'

export default defineComponent({
  props: {
    usernames: { type: Array as () => Array<string>, required: true },
    gameId: { type: Number, required: true },
  },
  setup(props) {
    const { t } = useI18n()
    // For some reason vue-i18n's interpolation doesn't work
    const title = computed(() =>
      t("Join {username}'s Duckguessr game!").toString().replace('{username}', props.usernames[0])
    )
    const gameUrl = `${location.origin}/matchmaking/${props.gameId}`
    useMeta(() => ({
      title: title.value,
      meta: [
        {
          property: 'og:title',
          content: title.value,
        },
        {
          property: 'og:url',
          content: gameUrl,
        },
        {
          property: 'og:image',
          content: `${location.origin}/favicon.ico`,
        },
      ],
    }))

    return {
      gameUrl,
      t,
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
