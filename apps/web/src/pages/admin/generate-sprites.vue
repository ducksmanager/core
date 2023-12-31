<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <a href="javascript:void(0)" @click="generateSprites()">Generate sprites</a>
</template>

<script setup lang="ts">
import { io, Socket } from "socket.io-client";

import {
  NamespaceEndpoint as EdgeCreatorNamespaceEndpoint,
  Services as EdgeCreatorServices,
} from "~services/edgecreator/types";
let socket: Socket<EdgeCreatorServices> = io(
  import.meta.env.VITE_SOCKET_URL + EdgeCreatorNamespaceEndpoint,
);

const generateSprites = async () => {
  await socket.emitWithAck("uploadEdges");
};
</script>
