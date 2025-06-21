<template>
  <podium-component v-if="players" :players="players" />
</template>
<script lang="ts" setup>
import { Socket, io } from "socket.io-client";
import type { player } from "~duckguessr-prisma-client";
import { ClientToServerEventsPodium } from "~duckguessr-types/socketEvents";

const players = ref(null as (player & { sumScore: number })[] | null);

console.log(import.meta.env.VITE_DM_SOCKET_URL);
const podiumSocket: Socket<ClientToServerEventsPodium> = io(
  `${import.meta.env.VITE_DM_SOCKET_URL}/podium`,
);

onMounted(async () => {
  players.value = await podiumSocket.emitWithAck("getPodium");
});
</script>
