import { mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState('currentEdges', ['edges']),
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
      this.setEdges([
        ...new Set(this.edges).add({
          status,
          ...edge,
        }),
      ])
    },
    getEdgesByStatus(status) {
      return (this.edges || []).filter((edge) => edge.status === status)
    },
    getEdgeStatus(edge) {
      return (
        this.edges.find(
          (currentEdge) =>
            currentEdge.country === edge.country &&
            currentEdge.magazine === edge.magazine &&
            currentEdge.issuenumber === edge.issuenumber
        ) || { status: 'none' }
      ).status
    },
    ...mapMutations('currentEdges', ['setEdges']),
  },
  mounted() {
    if (this.edges !== null) {
      return
    }
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
}
