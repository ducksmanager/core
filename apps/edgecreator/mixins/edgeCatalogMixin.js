import { mapActions, mapState, mapWritableState } from 'pinia'
import { edgeCatalog } from '~/stores/edgeCatalog'
import { coa } from '~/stores/coa'
import { user } from '~/stores/user'
import svgUtilsMixin from '@/mixins/svgUtilsMixin'

export default {
  computed: {
    ...mapState(edgeCatalog, ['currentEdges', 'publishedEdges']),
    ...mapState(coa, ['publicationNames']),
    ...mapWritableState(user, ['allUsers', 'username']),
  },
  mixins: [svgUtilsMixin],

  data: () => ({
    isCatalogLoaded: false,
    edgeCategories: [
      {
        status: 'ongoing',
        l10n: 'Ongoing edges',
        apiUrl: '/api/edgecreator/v2/model',
        svgCheckFn: (edge, currentUser) => edge.designers.includes(currentUser),
      },
      {
        status: 'ongoing by another user',
        l10n: 'Ongoing edges handled by other users',
        apiUrl: '/api/edgecreator/v2/model/editedbyother/all',
        svgCheckFn: (edge) => edge.designers.length,
      },
      {
        status: 'pending',
        l10n: 'Pending edges',
        apiUrl: '/api/edgecreator/v2/model/unassigned/all',
        svgCheckFn: () => true,
      },
    ],
  }),

  methods: {
    ...mapActions(edgeCatalog, ['addCurrentEdges', 'addPublishedEdges']),
    ...mapActions(coa, ['fetchPublicationNames']),
    ...mapActions(user, ['fetchAllUsers']),

    getEdgeFromApi(
      {
        pays: country,
        magazine,
        numero: issuenumber,
        contributeurs: contributors,
        photos,
      },
      status
    ) {
      const vm = this
      const issuecode = `${country}/${magazine} ${issuenumber}`
      const getContributorsOfType = (contributionType) =>
        (contributors || [])
          .filter(({ contribution }) => contribution === contributionType)
          .map(
            ({ idUtilisateur }) =>
              vm.allUsers.find(({ id }) => id === idUtilisateur).username
          )
      const photo =
        photos &&
        photos.find(({ estphotoprincipale: isMainPhoto }) => isMainPhoto)
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
      const currentUser = this.username
      return {
        ...edge,
        v3: true,
        status: this.edgeCategories.reduce(
          (acc, { status, svgCheckFn }) =>
            acc || (svgCheckFn(edge, currentUser) ? status : null),
          null
        ),
      }
    },
    getEdgesByStatus(status) {
      return Object.values(this.currentEdges).filter(
        ({ status: edgeStatus }) => edgeStatus === status
      )
    },
    getEdgeStatus({ country, magazine, issuenumber }) {
      let isPublished = false
      const publicationcode = `${country}/${magazine}`
      const publishedEdgesForPublication =
        this.publishedEdges[publicationcode] || {}
      if (publishedEdgesForPublication[issuenumber]) {
        isPublished = true
      }
      const issuecode = `${publicationcode} ${issuenumber}`

      return (
        this.currentEdges[issuecode] || {
          status: isPublished ? 'Published' : 'none',
        }
      ).status
    },

    async loadCatalog(withDetails) {
      if (this.isCatalogLoaded) {
        return
      }
      const vm = this
      let currentEdges = {}
      const publishedSvgEdges = {}

      for (const { status, apiUrl } of this.edgeCategories) {
        const data = await this.$axios.$get(apiUrl)
        currentEdges = data.reduce((acc, edgeData) => {
          const edge = this.getEdgeFromApi(edgeData, status)
          return { ...acc, [edge.issuecode]: edge }
        }, currentEdges)
      }

      const edges = await this.$axios.$get('/fs/browseEdges')
      for (const edgeStatus in edges) {
        for (const fileName of edges[edgeStatus]) {
          const [, country, magazine, issuenumber] = fileName.match(
            /\/([^/]+)\/gen\/_?([^.]+)\.(.+).svg$/
          )
          if ([country, magazine, issuenumber].includes(undefined)) {
            console.error(`Invalid SVG file name : ${fileName}`)
            continue
          }
          const publicationcode = `${country}/${magazine}`
          const issuecode = `${publicationcode} ${issuenumber}`
          try {
            if (edgeStatus === 'published') {
              if (!publishedSvgEdges[publicationcode]) {
                publishedSvgEdges[publicationcode] = {}
              }
              publishedSvgEdges[publicationcode][issuenumber] = {
                issuenumber,
                v3: true,
              }
            } else if (withDetails) {
              const { svgChildNodes } = await this.loadSvgFromString(
                country,
                magazine,
                issuenumber,
                edgeStatus === 'published'
              )
              const designers = vm.getSvgMetadata(
                svgChildNodes,
                'contributor-designer'
              )
              const photographers = vm.getSvgMetadata(
                svgChildNodes,
                'contributor-photographer'
              )

              currentEdges[issuecode] = vm.getEdgeFromSvg({
                country,
                magazine,
                issuenumber,
                designers,
                photographers,
              })
            } else {
              currentEdges[issuecode] = vm.getEdgeFromSvg({
                country,
                magazine,
                issuenumber,
                designers: [],
                photographers: [],
              })
            }
          } catch (e) {
            console.error(
              `No SVG found : ${country}/${magazine} ${issuenumber}`
            )
          }
        }
      }

      if (Object.keys(currentEdges).length) {
        await this.fetchPublicationNames([
          ...new Set(
            Object.values(currentEdges).map(
              ({ country, magazine }) => `${country}/${magazine}`
            )
          ),
        ])

        for (const edgeIssueCode of Object.keys(currentEdges)) {
          currentEdges[edgeIssueCode].published = vm.getEdgeStatus(
            currentEdges[edgeIssueCode]
          )
        }

        this.addCurrentEdges(currentEdges)
      }

      this.addPublishedEdges(publishedSvgEdges)

      this.isCatalogLoaded = true
    },
  },
  async mounted() {
    await this.fetchAllUsers()
    this.username = this.$cookies.get('dm-user')
  },
}
