<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <b-table v-if="bookstores" :items="bookstores">
    <template #cell(comments)="{ value }">
      <div
        v-for="comment in (value as typeof bookstores[number]['comments'])"
        :key="`comment-${comment.id}`"
        class="mb-2"
      >
        <u>{{ comment.userId }} on {{ comment.creationDate }}</u
        >:
        <div>
          <quote>{{ comment.comment }}</quote>
        </div>
        <BookstoreRatings dark :model-value="comment" readonly />
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
import { EventOutput } from "socket-call-client";
import { type AdminClientEvents as AdminBookstoreEvents } from "~dm-services/bookstores";
import type { bookstoreComment } from "~prisma-schemas/schemas/dm";

let bookstores =
  $shallowRef<EventOutput<AdminBookstoreEvents, "getBookstores">>();

const { adminBookstore: adminBookstoreEvents } = inject(socketInjectionKey)!;

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
