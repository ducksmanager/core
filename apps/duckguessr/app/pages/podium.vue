<template>
  <podium-component v-if="players" :players="players" />
</template>
<script lang="ts" setup>
import type { player } from "~duckguessr-prisma-browser";
import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";

const { podiumSocket } = inject(duckguessrSocketInjectionKey)!;

const players = ref(null as (player & { sumScore: number })[] | null);

onMounted(async () => {
  players.value = await podiumSocket.value.getPodium();
});
</script>
