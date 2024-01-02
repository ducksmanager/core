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
import { SimpleBookstore } from "~dm-types/SimpleBookstore";
import type { bookstoreComment } from "~prisma-clients/client_dm";
import {
  NamespaceEndpoint as BookstoresNamespaceEndpoint,
  Services as BookstoresServices,
} from "~services/bookstores/types";

const services = useSocket<BookstoresServices>(BookstoresNamespaceEndpoint);

let bookstores = $ref(null as SimpleBookstore[] | null);

const validateBookstoreComment = async ({ id }: bookstoreComment) => {
  await services.approveBookstoreComment(id);
};

(async () => {
  bookstores = await services.getActiveBookstores();
})();
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
