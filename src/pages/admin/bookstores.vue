<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <BTable v-if="bookstores" :items="bookstores">
    <template #cell(comments)="{ value }">
      <div v-for="comment in value" :key="`comment-${comment.id}`">
        <u>{{ comment.username }} on {{ comment.creationDate }}</u>: {{ comment.comment }}
        <BButton
          v-if="!comment.active"
          show
          @click="validateBookstoreComment(comment)"
        >
          {{ $t("Valider") }}
        </BButton>
      </div>
    </template>
  </BTable>
</template>

<script setup>
import axios from 'axios'
import { BButton, BTable } from 'bootstrap-vue-3'
import { onMounted } from 'vue'

let bookstores = $ref(null)

const validateBookstoreComment = async ({ id }) => {
  await axios.post('/admin/bookstoreComment/approve', { id })
  bookstores = (await axios.get('/admin/bookstoreComment/list')).data
}

onMounted(async () => {
  bookstores = (await axios.get('/admin/bookstoreComment/list')).data
})
</script>

<style scoped lang="scss">
.table :deep(td) {
  vertical-align: middle;
}
</style>
