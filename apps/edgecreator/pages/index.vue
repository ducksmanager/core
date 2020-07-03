<template>
  <div>
    <h1>{{ $t('header.dashboard') }}</h1>

    <h3>{{ $t('header.ongoing_edges') }}</h3>

    <b-container>
      <b-card-group deck columns>
        <b-card v-for="(edge, i) in edges" :key="i" class="col-md-4 text-center">
          <b-link :to="`edit/${edge.country}/${edge.magazine}/${edge.issuenumber}`">
            <b-card-text>{{ edge.country }}/{{ edge.magazine }} {{ edge.issuenumber }}</b-card-text>
          </b-link>
        </b-card>
      </b-card-group>
    </b-container>

    <h3>{{ $t('header.send_photos') }}</h3>
    <b-container align="center">
      <b-button to="/upload">{{ $t('button.send_photos') }}</b-button>
    </b-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      edges: [],
    }
  },
  mounted() {
    const vm = this
    this.$axios
      .$get('/api/edgecreator/v2/model')
      .then((data) => {
        vm.edges = data.map((edge) => ({
          country: edge.pays,
          magazine: edge.magazine,
          issuenumber: edge.numero,
        }))
      })
      .catch((e) => {
        console.error(e)
      })
  },
  middleware: 'authenticated',
}
</script>
<style scoped lang="css">
.clickable {
  cursor: pointer;
}
</style>
