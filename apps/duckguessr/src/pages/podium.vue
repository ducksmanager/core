<template>
  <podium v-if="players" :players="players" />
</template>
<script lang="ts" setup>
import { Socket, io } from "socket.io-client";
import { player } from "~duckguessr-api/types/prisma-client";
import { ClientToServerEventsPodium } from "~duckguessr-api/types/socketEvents";

const players = ref(null as player[] | null);

const podiumSocket: Socket<ClientToServerEventsPodium> = io("/datasets");

onMounted(async () => {
  players.value = await podiumSocket.emitWithAck("getPodium");
});
</script>
