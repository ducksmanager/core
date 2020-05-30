<template>
  <div>
    <h1>Dashboard</h1>

    <b-container>
      <b-card-group deck columns>
        <b-card
          v-for="(edge, i) in edges"
          :key="i"
          class="col-md-4 text-center"
        >
          <b-link :to="`edit/${edge.id}`">
            <b-card-text
              >{{ edge.pays }}/{{ edge.magazine }}
              {{ edge.numero }}</b-card-text
            >
          </b-link>
        </b-card>
      </b-card-group>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      edges: []
    }
  },
  mounted() {
    const vm = this
    this.$axios
      .$get('/api/edgecreator/v2/model')
      .then((data) => {
        vm.edges = data
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e)
      })
  },
  middleware: 'authenticated'
}
</script>
<style scoped lang="css">
.clickable {
  cursor: pointer;
}
</style>
