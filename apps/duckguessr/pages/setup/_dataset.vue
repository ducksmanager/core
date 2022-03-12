<template>
  <b-container class="d-flex flex-column align-items-center border p-3">
    <h3>Nouvelle partie</h3>

    <b-container class="my-4">
      <b-row class="align-items-center w-100">
        <b-col cols="6" class="text-right">{{ t('Nombre de joueurs') }}</b-col>
        <b-col cols="1" class="d-flex justify-content-center">
          {{ numberOfPlayers }}
        </b-col>
        <b-col cols="5" class="d-flex justify-content-center">
          <b-form-input v-model="numberOfPlayers" type="range" :min="addBot ? 1 : 2" :max="6" />
        </b-col>
      </b-row>
      <b-row class="align-items-center w-100 mt-3">
        <b-col cols="6" class="text-right">
          <label for="add-bot">{{ t('Ajouter un bot') }}</label>
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
                  "Si vous décidez d'ajouter un bot, le nombre de joueurs minimal est de 1 (vous seul(e) contre le bot)."
                )
              }}
            </div>
            <div>{{ t('Sinon, le nombre de joueurs minimal est de 2.') }}</div>
          </template>
          <div v-else>
            {{ t('Les bots ne sont pas encore disponibles pour le mode de jeu "Artistes US"') }}
          </div>
        </b-col>
      </b-row>
    </b-container>
    <b-button variant="success" @click="iAmReady()">{{ t("C'est parti !") }}</b-button>
  </b-container>
</template>

<script lang="ts" setup>
import { useRouter, useRoute, ref, computed } from '@nuxtjs/composition-api'
import { io } from 'socket.io-client'
import type Index from '@prisma/client'
import { useI18n } from 'nuxt-i18n-composable'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const matchmakingSocket = io(`${process.env.SOCKET_URL}/matchmaking`, {
  auth: {
    cookie: document.cookie,
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
