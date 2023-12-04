<template>
  <podium-component v-if="players" :players="players" />
</template>
<script lang="ts" setup>
import { Socket, io } from "socket.io-client";
import { player } from "~duckguessr-api/types/prisma-client";
import { ClientToServerEventsPodium } from "~duckguessr-api/types/socketEvents";

const players = ref(null as (player & { sumScore: number })[] | null);

console.log(import.meta.env.VITE_SOCKET_URL);
const podiumSocket: Socket<ClientToServerEventsPodium> = io(
  `${import.meta.env.VITE_SOCKET_URL}/podium`
);

onMounted(async () => {
  players.value = await podiumSocket.emitWithAck("getPodium");
});
</script>
