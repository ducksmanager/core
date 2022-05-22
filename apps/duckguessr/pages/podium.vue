<template>
  <podium v-if="players" :players="players" />
</template>
<script lang="ts" setup>
import Index from '@prisma/client'
import { onMounted, ref } from '@nuxtjs/composition-api'
import { useAxios } from '@vueuse/integrations/useAxios'
const players = ref(null as Index.player[] | null)

onMounted(async () => {
  players.value = (await useAxios(`/api/podium`)).data.value.players
})
</script>
