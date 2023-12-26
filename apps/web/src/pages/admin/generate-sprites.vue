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
  Namespace as EdgeCreatorNamespace,
  Services as EdgeCreatorServices,
} from "~api/services/edgecreator/types";
let socket: Socket<EdgeCreatorServices> = io(
  import.meta.env.VITE_SOCKET_URL + EdgeCreatorNamespace["endpoint"],
);

const generateSprites = async () => {
  await socket.emitWithAck("uploadEdges");
};
</script>
