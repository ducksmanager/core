<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <b-table v-if="bookstores" :items="bookstores">
    <template #cell(comments)="{ value }">
      <div v-for="comment in value" :key="`comment-${comment.id}`">
        <u>{{ comment.username }} on {{ comment.creationDate }}</u
        >: {{ comment.comment }}
        <b-button
          v-if="!comment.active"
          show
          @click="validateBookstoreComment(comment)"
        >
          {{ $t("Valider") }}
        </b-button>
      </div>
    </template>
  </b-table>
</template>

<script setup lang="ts">
import axios from "axios";
import { BButton, BTable } from "bootstrap-vue-3";
import { onMounted } from "vue";

import { bookstoreComment } from "~prisma_clients/client_dm";
import routes from "~types/routes";
import { SimpleBookstore } from "~types/SimpleBookstore";

let bookstores = $ref(null as SimpleBookstore[] | null);

const validateBookstoreComment = async ({ id }: bookstoreComment) => {
  await routes["POST /bookstores/approve"](axios, { id });
  bookstores = (await routes["GET /bookstores"](axios)).data;
};

onMounted(async () => {
  bookstores = (await routes["GET /bookstores"](axios))
    .data as SimpleBookstore[];
});
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
