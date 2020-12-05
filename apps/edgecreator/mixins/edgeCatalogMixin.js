import { mapActions, mapMutations, mapState } from 'vuex'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'

export default {
  computed: {
    ...mapState('edgeCatalog', ['currentEdges', 'publishedEdges']),
    ...mapState('coa', ['publications']),
  },
  mixins: [svgUtilsMixin],

  data: () => ({
    hasPublicationNames: false,
  }),
  methods: {
    ...mapActions('coa', ['loadPublicationsByCountry']),

    addEdgeFromApi(
      { pays: country, magazine, numero: issuenumber, contributeurs: contributors },
      status
    ) {
      this.addCurrentEdge(
        {
          country,
          magazine,
          issuenumber,
          v3: false,
          designers: (contributors || [])
            .filter(({ contribution }) => contribution === 'createur')
            .map(({ idUtilisateur }) => idUtilisateur),
        },
        status
      )
    },
    addEdgeFromSvg(edge, edgeDesigners) {
      this.addCurrentEdge(
        { ...edge, v3: true, designers: edgeDesigners },
        edgeDesigners.length
          ? edgeDesigners.includes(this.$cookies.get('dm-user'))
            ? 'ongoing'
            : 'ongoing_by_other_user'
          : 'pending'
      )
    },
    addCurrentEdge(edge, status) {
      this.setCurrentEdges([
        ...new Set([
          ...(this.currentEdges || []),
          {
            status,
            ...edge,
          },
        ]),
      ])
    },
    getEdgesByStatus(status) {
      return (this.currentEdges || []).filter(({ status: edgeStatus }) => edgeStatus === status)
    },
    getEdgeStatus({ country, issuenumber, magazine }) {
      const isPublished = (this.publishedEdges[`${country}/${magazine}`] || []).some(
        (publishedEdge) => publishedEdge.issuenumber === issuenumber
      )

      return (
        this.currentEdges.find(
          (currentEdge) =>
            currentEdge.country === country &&
            currentEdge.magazine === magazine &&
            currentEdge.issuenumber === issuenumber
        ) || { status: isPublished ? 'published' : 'none' }
      ).status
    },
    ...mapMutations('edgeCatalog', ['setCurrentEdges']),
  },

  watch: {
    currentEdges: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          const vm = this
          const currentEdgeCountryCodes = [...new Set(newValue.map(({ country }) => country))]

          currentEdgeCountryCodes.forEach((country) => {
            vm.loadPublicationsByCountry(country)
          })
        }
      },
    },
  },

  async mounted() {
    if (this.currentEdges !== null) {
      return
    }
    const vm = this
    const apiCalls = [
      { status: 'ongoing', url: '/api/edgecreator/v2/model' },
      { status: 'ongoing_by_other_user', url: '/api/edgecreator/v2/model/editedbyother/all' },
      { status: 'pending', url: '/api/edgecreator/v2/model/unassigned/all' },
    ]
    for (const { status, url } of apiCalls) {
      const data = await this.$axios.$get(url)
      data.forEach((edge) => {
        vm.addEdgeFromApi(edge, status)
      })
    }

    this.hasPublicationNames = true

    this.$axios.$get('/fs/browseCurrentEdges').then((currentEdges) => {
      currentEdges.forEach(async (fileName) => {
        const [, country, magazine, issuenumber] = fileName.match(
          /\/([^/]+)\/gen\/_([^.]+)\.(.+).svg$/
        )
        if ([country, magazine, issuenumber].includes(undefined)) {
          console.error(`Invalid SVG file name : ${fileName}`)
          return
        }
        const { svgChildNodes } = await this.loadSvgFromString(country, magazine, issuenumber)
        const edgeDesigners = vm.getSvgMetadata(svgChildNodes, 'contributor-designer')

        vm.addEdgeFromSvg({ country, magazine, issuenumber }, edgeDesigners)
      })
    })
  },
}
