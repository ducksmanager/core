import { defineStore } from "pinia";

import { api } from "~/stores/api";
import { GET__global_stats__user__list } from "~dm_types/routes";
import type { SimpleUser } from "~types/SimpleUser";

import { call } from "../../axios-helper";

export const users = defineStore("users", () => {
  const allUsers = ref(null as SimpleUser[] | null),
    fetchAllUsers = async () => {
      if (!allUsers.value) {
        allUsers.value = (
          await call(api().dmApi, new GET__global_stats__user__list())
        ).data;
      }
    };
  return {
    allUsers,
    fetchAllUsers,
  };
});
