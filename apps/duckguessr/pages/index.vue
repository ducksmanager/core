<template>
  <b-container class="d-flex flex-column align-items-center">
    <h3>{{ t('Welcome to Duckguessr!') }}</h3>
    <b-container class="d-flex flex-column align-items-center my-3">
      <iframe
        width="560"
        height="315"
        :src="`https://www.youtube.com/embed/${youtubeVideoId}?controls=0&autohide=1`"
        title="Duckguessr trailer"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </b-container>
    <h3>{{ t('Create a game') }}</h3>
    <alert-not-connected v-if="isAnonymous === true" />
    <b-card-group deck>
      <b-card
        v-for="{ title, description, name, images, authors } in datasets"
        :key="name"
        :title="t(title)"
        img-top
        align="center"
        :style="matchCreationSocket ? '' : 'pointer-events: none'"
        @click="createMatch(name)"
      >
        <b-card-header class="my-2 bg-transparent border-0 small">
          {{ t(description) }}
        </b-card-header>
        <b-card-footer>
          {{ t('Images') }}: {{ images }}, {{ t('authors') }}: {{ authors }}
        </b-card-footer>
      </b-card>
    </b-card-group>
  </b-container>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, useRouter, watch } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { useAxios } from '@vueuse/integrations/useAxios'
import { io, Socket } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import { userStore } from '~/store/user'
const router = useRouter()

const { t, locale } = useI18n()

const datasets = ref([] as Array<any>)

const isAnonymous = computed(() => userStore().isAnonymous)
const matchCreationSocket = ref(null as Socket | null)

const youtubeVideoId = computed(() => (locale.value === 'fr' ? '21Zfy5bOQkA' : 'F0j-MMTiT3w'))

const createMatch = (datasetName: string) => {
  matchCreationSocket.value?.emit('createMatch', datasetName, (gameId: number) => {
    matchCreationSocket.value!.close()
    router.replace(`/matchmaking/${gameId}`)
  })
}

watch(
  () => userStore().user?.username,
  (username) => {
    if (username) {
      matchCreationSocket.value = io(`${process.env.SOCKET_URL}/match`, {
        auth: {
          cookie: useCookies().getAll(),
        },
      })
    }
  },
  { immediate: true }
)

onMounted(async () => {
  datasets.value = (await useAxios(`/api/dataset`)).data.value.datasets
})
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
}
</style>
