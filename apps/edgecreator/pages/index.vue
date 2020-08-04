<template>
  <div>
    <h1>{{ $t('header.dashboard') }}</h1>

    <h3>{{ $t('header.ongoing_edges') }}</h3>

    <b-container>
      <b-card-group v-if="getEdgesByStatus('ongoing').length" deck columns>
        <b-card
          v-for="(edge, i) in getEdgesByStatus('ongoing')"
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
      <b-card-group v-if="getEdgesByStatus('pending').length" deck columns>
        <b-card
          v-for="(edge, i) in getEdgesByStatus('pending')"
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
      <b-card-group v-if="getEdgesByStatus('ongoing_by_other_user').length" deck columns>
        <b-card
          v-for="(edge, i) in getEdgesByStatus('ongoing_by_other_user')"
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
import svgUtilsMixin from '@/mixins/svgUtilsMixin'

export default {
  mixins: [svgUtilsMixin],
  data() {
    return {
      edges: [],
    }
  },
  mounted() {
    const vm = this
    const apiCalls = [
      { status: 'ongoing', url: '/api/edgecreator/v2/model' },
      { status: 'ongoing_by_other_user', url: '/api/edgecreator/v2/model/editedbyother/all' },
      { status: 'pending', url: '/api/edgecreator/v2/model/unassigned/all' },
    ]
    apiCalls.forEach(({ status, url }) => {
      vm.$axios
        .$get(url)
        .then((data) => {
          data.forEach((edge) => {
            vm.addEdgeFromApi(edge, status)
          })
        })
        .catch((e) => {
          console.error(e)
        })
    })

    this.$axios.$get('/fs/browseWipEdges').then((edges) => {
      edges.forEach(async (fileName) => {
        const [, country, magazine, issuenumber] = fileName.match(
          /\/([^/]+)\/gen\/_([^.]+)\.(.+).svg$/
        )
        if ([country, magazine, issuenumber].includes(undefined)) {
          console.error('Invalid SVG file name : ' + fileName)
          return
        }
        const { svgChildNodes } = await this.loadSvgFromString(country, magazine, issuenumber)
        const edgeDesigners = vm.getSvgMetadata(svgChildNodes, 'contributor-designer')

        vm.addEdgeFromSvg({ country, magazine, issuenumber }, edgeDesigners)
      })
    })
  },
  methods: {
    addEdgeFromApi(edge, status) {
      this.addEdge(
        {
          country: edge.pays,
          magazine: edge.magazine,
          issuenumber: edge.numero,
        },
        status
      )
    },
    addEdgeFromSvg(edge, edgeDesigners) {
      this.addEdge(
        edge,
        edgeDesigners.length
          ? edgeDesigners.includes(this.$cookies.get('dm-user'))
            ? 'ongoing'
            : 'ongoing_by_other_user'
          : 'pending'
      )
    },
    addEdge(edge, status) {
      this.edges = [
        ...new Set(this.edges).add({
          status,
          ...edge,
        }),
      ]
    },
    getEdgesByStatus(status) {
      return this.edges.filter((edge) => edge.status === status)
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
