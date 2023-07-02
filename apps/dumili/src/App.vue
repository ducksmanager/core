<template>
  <router-view />
</template>

<script setup lang="ts">
import { AxiosResponse } from "axios";
import { defaultApi } from "./util/api";
import { user } from "./stores/user";

defaultApi
  .get(`${import.meta.env.VITE_BACKEND_URL}/me`)
  .then((res: AxiosResponse<{ user: { username: string } }>) => {
    user().user = { username: res.data.user.username };
  });
</script>
