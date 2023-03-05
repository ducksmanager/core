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
import { onMounted } from "vue";

import { call } from "~/util/axios";
import { bookstoreComment } from "~prisma_clients/client_dm";
import { GET__bookstores, POST__bookstores__approve } from "~types/routes";
import { SimpleBookstore } from "~types/SimpleBookstore";

let bookstores = $ref(null as SimpleBookstore[] | null);

const validateBookstoreComment = async ({ id }: bookstoreComment) => {
  await call(axios, new POST__bookstores__approve({ reqBody: { id } }));
  bookstores = (await call(axios, new GET__bookstores())).data;
};

onMounted(async () => {
  bookstores = (await call(axios, new GET__bookstores())).data;
});
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
