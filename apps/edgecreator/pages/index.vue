<template>
  <div>
    <h1>{{ $t('header.dashboard') }}</h1>

    <h3>{{ $t('header.ongoing_edges') }}</h3>

    <b-container>
      <b-card-group v-if="getEdgesByType('ongoing').length" deck columns>
        <b-card
          v-for="(edge, i) in getEdgesByType('ongoing')"
          :key="i"
          class="col-md-4 text-center"
        >
          <b-link :to="`edit/${edge.country}/${edge.magazine}/${edge.issuenumber}`">
            <b-card-text>{{ edge.country }}/{{ edge.magazine }} {{ edge.issuenumber }}</b-card-text>
          </b-link>
        </b-card>
      </b-card-group>
      <div v-else align="center">{{ $t('no_edges_in_category') }}</div>
    </b-container>

    <h3>{{ $t('header.pending_edges') }}</h3>

    <b-container>
      <b-card-group v-if="getEdgesByType('pending').length" deck columns>
        <b-card
          v-for="(edge, i) in getEdgesByType('pending')"
          :key="i"
          class="col-md-4 text-center"
        >
          <b-link :to="`edit/${edge.country}/${edge.magazine}/${edge.issuenumber}`">
            <b-card-text>{{ edge.country }}/{{ edge.magazine }} {{ edge.issuenumber }}</b-card-text>
          </b-link>
        </b-card>
      </b-card-group>
      <div v-else align="center">{{ $t('no_edges_in_category') }}</div>
    </b-container>

    <h3>{{ $t('header.ongoing_by_other_user_edges') }}</h3>

    <b-container>
      <b-card-group v-if="getEdgesByType('ongoing_by_other_user').length" deck columns>
        <b-card
          v-for="(edge, i) in getEdgesByType('ongoing_by_other_user')"
          :key="i"
          class="col-md-4 text-center"
        >
          <b-card-text>{{ edge.country }}/{{ edge.magazine }} {{ edge.issuenumber }}</b-card-text>
        </b-card>
      </b-card-group>
      <div v-else align="center">{{ $t('no_edges_in_category') }}</div>
    </b-container>

    <hr />

    <b-container align="center" style="margin-bottom: 20px;">
      <b-button to="/upload">{{ $t('button.send_photos') }}</b-button>
    </b-container>

    <b-container align="center">
      <b-button to="/edit/new">{{ $t('button.create_or_update') }}</b-button>
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
        data.forEach((edge) => {
          vm.addEdge(edge, 'ongoing')
        })
      })
      .catch((e) => {
        console.error(e)
      })
    this.$axios
      .$get('/api/edgecreator/v2/model/editedbyother/all')
      .then((data) => {
        data.forEach((edge) => {
          vm.addEdge(edge, 'ongoing_by_other_user')
        })
      })
      .catch((e) => {
        console.error(e)
      })
    this.$axios
      .$get('/api/edgecreator/v2/model/unassigned/all')
      .then((data) => {
        data.forEach((edge) => {
          vm.addEdge(edge, 'pending')
        })
      })
      .catch((e) => {
        console.error(e)
      })
  },
  methods: {
    addEdge(edge, type) {
      this.edges.push({
        type,
        country: edge.pays,
        magazine: edge.magazine,
        issuenumber: edge.numero,
      })
    },
    getEdgesByType(type) {
      return this.edges.filter((edge) => edge.type === type)
    },
  },
  middleware: 'authenticated',
}
</script>
<style scoped lang="css">
.clickable {
  cursor: pointer;
}
</style>
