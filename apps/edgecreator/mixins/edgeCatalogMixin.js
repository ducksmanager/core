import { mapActions, mapMutations, mapState } from 'vuex'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'

export default {
  computed: {
    ...mapState('edgeCatalog', ['currentEdges', 'publishedEdges']),
    ...mapState('coa', ['publicationNames']),
    ...mapState('user', ['allUsers']),
  },
  mixins: [svgUtilsMixin],

  data: () => ({
    isCatalogLoaded: false,
    edgeCategories: [
      {
        status: 'ongoing',
        l10nKey: 'Ongoing edges',
        apiUrl: '/api/edgecreator/v2/model',
        svgCheckFn: (edge, currentUser) => edge.designers.includes(currentUser),
      },
      {
        status: 'ongoing_by_other_user',
        l10nKey: 'Ongoing edges handled by other users',
        apiUrl: '/api/edgecreator/v2/model/editedbyother/all',
        svgCheckFn: (edge) => edge.designers.length,
      },
      {
        status: 'pending',
        l10nKey: 'Pending edges',
        apiUrl: '/api/edgecreator/v2/model/unassigned/all',
        svgCheckFn: () => true,
      },
    ],
  }),

  methods: {
    ...mapMutations('edgeCatalog', ['addCurrentEdges', 'setPublishedEdges']),
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
      const currentUser = this.$cookies.get('dm-user')
      return {
        ...edge,
        v3: true,
        status: this.edgeCategories.reduce(
          (acc, { status, svgCheckFn }) => acc || (svgCheckFn(edge, currentUser) ? status : null),
          null
        ),
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

      return (this.currentEdges[issuecode] || { status: isPublished ? 'Published' : 'none' }).status
    },
  },

  async mounted() {
    await this.fetchAllUsers()
    const vm = this
    let newEdges = {}

    for (const { status, apiUrl } of this.edgeCategories) {
      const data = await this.$axios.$get(apiUrl)
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

      const publicationCodes = [
        ...new Set(
          Object.values(newEdges).map(({ country, magazine }) => `${country}/${magazine}`)
        ),
      ]
      await this.fetchPublicationNames(publicationCodes)

      for (const publicationCode of publicationCodes) {
        this.setPublishedEdges({
          publicationCode,
          publishedEdges: await this.$axios.$get(`/api/edges/${publicationCode}`),
        })
      }

      for (const edgeIssueCode of Object.keys(newEdges)) {
        newEdges[edgeIssueCode].published = vm.getEdgeStatus(newEdges[edgeIssueCode])
      }

      this.addCurrentEdges(newEdges)

      this.isCatalogLoaded = true
    })
  },
}
