<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <b-table v-if="bookstores" :items="bookstores">
    <template #cell(comments)="{ value }">
      <div
        v-for="comment in value"
        :key="`comment-${(comment as SimpleBookstore).id}`"
      >
        <u
          >{{ (comment as bookstoreComment).userId }} on
          {{ (comment as bookstoreComment).creationDate }}</u
        >: {{ (comment as bookstoreComment).comment }}
        <b-button
          v-if="!(comment as bookstoreComment).isActive"
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

import { call } from "~axios-helper";
import { SimpleBookstore } from "~dm-types/SimpleBookstore";
import type { bookstoreComment } from "~prisma-schemas/client_dm";

let bookstores = $ref(null as SimpleBookstore[] | null);

const validateBookstoreComment = async ({ id }: bookstoreComment) => {
  await call(axios, new POST__bookstores__approve({ reqBody: { id } }));
  bookstores = (await call(axios, new GET__bookstores())).data;
};

(async () => {
  bookstores = (await call(axios, new GET__bookstores())).data;
})();
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
