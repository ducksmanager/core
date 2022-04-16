<template>
  <podium v-if="players" :players="players" />
</template>
<script lang="ts" setup>
import Index from '@prisma/client'
import { onMounted, ref, useContext } from '@nuxtjs/composition-api'
const players = ref(null as Index.player[] | null)

const { $axios } = useContext()

onMounted(async () => {
  players.value = (await $axios.$get(`/api/podium`)).players
})
</script>
