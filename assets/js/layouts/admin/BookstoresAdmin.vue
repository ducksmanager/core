<template>
  <b-table
    v-if="bookstores"
    :items="bookstores"
  >
    <template #cell(comments)="{value}">
      <div
        v-for="comment in value"
        :key="`comment-${comment.id}`"
      >
        <u>{{ comment.username }} on {{ comment.creationDate }}</u>: {{ comment.comment }} <b-btn
          v-if="!comment.active"
          show
          @click="validateBookstoreComment(comment)"
        >
          {{ $t("Valider") }}
        </b-btn>
      </div>
    </template>
  </b-table>
</template>
<script>
import axios from "axios";

export default {
  name: "BookstoresAdmin",

  data: () => ({
    bookstores: null
  }),

  async mounted() {
    this.bookstores = (await axios.get("/admin/bookstoreComment/list")).data;
  },

  methods: {
    async validateBookstoreComment({ id }) {
      await axios.post("/admin/bookstoreComment/approve", { id });
      this.bookstores = (await axios.get("/admin/bookstoreComment/list")).data;
    }
  }
};
</script>

<style scoped lang="scss">
.table ::v-deep td {
  vertical-align: middle;
}
</style>
