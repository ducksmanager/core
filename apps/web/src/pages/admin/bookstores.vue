<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <b-table v-if="bookstores" :items="bookstores">
    <template #cell(comments)="{ value }: { value: bookstoreComment[] }">
      <div v-for="comment in value" :key="`comment-${comment.id}`">
        <u>{{ comment.userId }} on {{ comment.creationDate }}</u
        >: {{ comment.comment }}
        <b-button
          v-if="!comment.isActive"
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

let bookstores = $shallowRef<SimpleBookstore[]>();

const {
  adminBookstore: { events: adminBookstoreEvents },
} = inject(socketInjectionKey)!;

const validateBookstoreComment = async ({ id }: bookstoreComment) => {
  await adminBookstoreEvents.approveBookstoreComment(id);
};

(async () => {
  bookstores = await adminBookstoreEvents.getBookstores();
})();
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
