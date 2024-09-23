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
import type { SimpleBookstore } from "~dm-types/SimpleBookstore";
import type { bookstoreComment } from "~prisma-schemas/schemas/dm";

let bookstores = $shallowRef<SimpleBookstore[] | null>(null);

const {
  bookstore: { services: bookstoreServices },
} = inject(socketInjectionKey)!;

const validateBookstoreComment = async ({ id }: bookstoreComment) => {
  await bookstoreServices.approveBookstoreComment(id);
};

(async () => {
  bookstores = await bookstoreServices.getActiveBookstores();
})();
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
