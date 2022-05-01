<template>
  <b-container class="d-flex flex-column align-items-center border p-3">
    <h3>Nouvelle partie</h3>

    <b-container class="my-4">
      <b-row class="align-items-center w-100 mb-3">
        <b-col cols="6" class="text-right">
          <label for="add-bot">{{ t('Add a bot') }}</label>
        </b-col>
        <b-col cols="1" class="d-flex justify-content-center pl-4">
          <b-form-checkbox
            id="add-bot"
            v-model="addBot"
            :disabled="!isBotAvailable"
            @input="
              numberOfPlayers = String(Math.max(1 + ($event ? 0 : 1), parseInt(numberOfPlayers)))
            "
          />
        </b-col>
        <b-col cols="5" class="d-flex justify-content-center flex-column small">
          <template v-if="isBotAvailable">
            <div>
              {{
                t(
                  'If you decide to add a bot, the minimum number of players is 1 (yourself against the bot).'
                )
              }}
            </div>
            <div>{{ t('Otherwise, the minimum number of players is 2.') }}</div>
          </template>
          <div v-else>
            {{ t("Bots are not available yet for the 'US artists' game") }}
          </div>
        </b-col>
      </b-row>
      <b-row class="align-items-center w-100">
        <b-col cols="6" class="text-right">{{ t('Number of players') }}</b-col>
        <b-col cols="1" class="d-flex justify-content-center">
          {{ numberOfPlayers }}
        </b-col>
        <b-col cols="5" class="d-flex justify-content-center">
          <b-form-input v-model="numberOfPlayers" type="range" :min="addBot ? 1 : 2" :max="6" />
        </b-col>
      </b-row>
    </b-container>
    <b-button variant="success" @click="iAmReady()">{{ t("Let's go!") }}</b-button>
  </b-container>
</template>

<script lang="ts" setup>
import { useRouter, useRoute, ref, computed } from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import type Index from '@prisma/client'
import { useI18n } from 'nuxt-i18n-composable'
import { useCookies } from '@vueuse/integrations/useCookies'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking`, {
  auth: {
    cookie: useCookies().getAll(),
  },
})

const iAmReady = () => {
  matchmakingSocket.emit(
    'iAmReady',
    route.value.params.dataset,
    parseInt(numberOfPlayers.value),
    addBot.value,
    ({ gameId }: { gameId: number; player: Index.player }) => {
      matchmakingSocket.close()
      router.replace(`/matchmaking/${gameId}`)
    }
  )

  matchmakingSocket.on('matchStarts', (gameId: number) => {
    setTimeout(() => {
      // Leave time for the iAmReady callback to be called
      console.debug(`Match is starting on game ${gameId}`)
      matchmakingSocket.close()
      router.replace(`/game/${gameId}`)
    }, 200)
  })
}

const numberOfPlayers = ref('2' as string)
const addBot = ref(false as boolean)

const isBotAvailable = computed(() => route.value.params.dataset !== 'us')
</script>

<style scoped lang="scss">
label {
  margin-bottom: 0;
}
.border {
  border-radius: 10px;
}
</style>
