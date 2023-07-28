<template>
  <router-view />
</template>

<script setup lang="ts">
import { AxiosResponse } from "axios";

import { user } from "./stores/user";
import { defaultApi } from "./util/api";

defaultApi
  .get(`${import.meta.env.VITE_BACKEND_URL}/me`)
  .then((res: AxiosResponse<{ user: { username: string } }>) => {
    user().user = { username: res.data.user.username };
  });
</script>
