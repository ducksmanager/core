<template>
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
</template>

<script lang="ts" setup>
import { onMounted, ref, useRouter, watch } from '@nuxtjs/composition-api'
import { useI18n } from 'nuxt-i18n-composable'
import { useAxios } from '@vueuse/integrations/useAxios'
import { io, Socket } from 'socket.io-client'
import { useCookies } from '@vueuse/integrations/useCookies'
import { userStore } from '~/store/user'
const router = useRouter()

const { t } = useI18n()

const datasets = ref([] as Array<any>)

const matchCreationSocket = ref(null as Socket | null)

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
