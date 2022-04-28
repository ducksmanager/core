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
<script setup>
import axios from "axios";
import { BButton, BTable } from "bootstrap-vue-3";
import { onMounted } from "vue";

const bookstores = ref(null),
  validateBookstoreComment = async ({ id }) => {
    await axios.post("/admin/bookstoreComment/approve", { id });
    bookstores.value = (await axios.get("/admin/bookstoreComment/list")).data;
  };

onMounted(async () => {
  bookstores.value = (await axios.get("/admin/bookstoreComment/list")).data;
});
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
