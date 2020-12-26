import { mapActions, mapMutations, mapState } from 'vuex'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'

export default {
  computed: {
    ...mapState('edgeCatalog', ['currentEdges', 'publishedEdges']),
    ...mapState('coa', ['publicationNames']),
    ...mapState('user', ['allUsers']),
  },
  mixins: [svgUtilsMixin],

  methods: {
    ...mapMutations('edgeCatalog', ['addCurrentEdges']),
    ...mapActions('coa', ['fetchPublicationNames']),
    ...mapActions('user', ['fetchAllUsers']),

    getEdgeFromApi(
      { pays: country, magazine, numero: issuenumber, contributeurs: contributors, photos },
      status
    ) {
      const vm = this
      const issuecode = `${country}/${magazine} ${issuenumber}`
      const getContributorsOfType = (contributionType) =>
        (contributors || [])
          .filter(({ contribution }) => contribution === contributionType)
          .map(({ idUtilisateur }) => vm.allUsers.find(({ id }) => id === idUtilisateur).username)
      const photo = photos && photos.find(({ estphotoprincipale: isMainPhoto }) => isMainPhoto)
      return {
        country,
        magazine,
        issuenumber,
        issuecode,
        v3: false,
        designers: getContributorsOfType('createur'),
        photographers: getContributorsOfType('photographe'),
        photo: photo && photo.idImage.nomfichier,
        status,
      }
    },
    getEdgeFromSvg(edge) {
      return {
        ...edge,
        v3: true,
        status: edge.designers.length
          ? edge.designers.includes(this.$cookies.get('dm-user'))
            ? 'ongoing'
            : 'ongoing_by_other_user'
          : 'pending',
      }
    },
    getEdgesByStatus(status) {
      return Object.values(this.currentEdges).filter(
        ({ status: edgeStatus }) => edgeStatus === status
      )
    },
    getEdgeStatus({ country, issuenumber, magazine }) {
      const isPublished = (this.publishedEdges[`${country}/${magazine}`] || []).some(
        (publishedEdge) => publishedEdge.issuenumber === issuenumber
      )
      const issuecode = `${country}/${magazine} ${issuenumber}`

      return (this.currentEdges[issuecode] || { status: isPublished ? 'published' : 'none' }).status
    },
  },

  async mounted() {
    await this.fetchAllUsers()
    const vm = this
    let newEdges = {}

    const apiCalls = [
      { status: 'ongoing', url: '/api/edgecreator/v2/model' },
      { status: 'ongoing_by_other_user', url: '/api/edgecreator/v2/model/editedbyother/all' },
      { status: 'pending', url: '/api/edgecreator/v2/model/unassigned/all' },
    ]
    for (const { status, url } of apiCalls) {
      const data = await this.$axios.$get(url)
      newEdges = data.reduce((acc, edgeData) => {
        const edge = this.getEdgeFromApi(edgeData, status)
        return { ...acc, [edge.issuecode]: edge }
      }, newEdges)
    }

    this.$axios.$get('/fs/browseCurrentEdges').then(async (currentEdges) => {
      for (const fileName of currentEdges) {
        const [, country, magazine, issuenumber] = fileName.match(
          /\/([^/]+)\/gen\/_([^.]+)\.(.+).svg$/
        )
        if ([country, magazine, issuenumber].includes(undefined)) {
          console.error(`Invalid SVG file name : ${fileName}`)
          continue
        }
        const issuecode = `${country}/${magazine} ${issuenumber}`
        const { svgChildNodes } = await this.loadSvgFromString(country, magazine, issuenumber)
        const designers = vm.getSvgMetadata(svgChildNodes, 'contributor-designer')
        const photographers = vm.getSvgMetadata(svgChildNodes, 'contributor-photographer')

        newEdges[issuecode] = vm.getEdgeFromSvg({
          country,
          magazine,
          issuenumber,
          designers,
          photographers,
        })
      }

      this.addCurrentEdges(newEdges)
      await this.fetchPublicationNames([
        ...new Set(
          Object.values(newEdges).map(({ country, magazine }) => `${country}/${magazine}`)
        ),
      ])
    })
  },
}
