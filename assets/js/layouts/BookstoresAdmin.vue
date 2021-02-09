<template>
  <b-table
    v-if="bookstores"
    :items="bookstores"
  >
    <template #cell(active)="{item, value}">
      {{ data }}
      <b-btn
        v-if="!value"
        show
        @click="validateBookstore(item)"
      >
        {{ $t("Valider") }}
      </b-btn>
      <div v-else>
        Active
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
    this.bookstores = (await axios.get("/admin/bookstore/list")).data;
  },

  methods: {
    async validateBookstore({ id }) {
      await axios.post("/admin/bookstore/approve", { id });
      this.bookstores = (await axios.get("/admin/bookstore/list")).data;
    }
  }
};
</script>

<style scoped lang="scss">
.table ::v-deep td {
  vertical-align: middle;
}
</style>
