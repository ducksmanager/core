<template>
  <div v-show="$gates.getRoles().length">
    <session-info />
    <h1>{{ $t('Dashboard') }}</h1>

    <b-alert v-if="!isCatalogLoaded" show variant="info">{{ $t('Loading...') }}</b-alert>

    <template v-else>
      <h3>{{ $t('Edge creation') }}</h3>

      <b-container align="center">
        <template v-if="isUploadableEdgesCarouselReady">
          <UploadableEdgesCarousel
            v-if="mostPopularIssuesInCollectionWithoutEdge.length"
            :user-points="userPhotographerPoints"
            :issues="mostPopularIssuesInCollectionWithoutEdge"
            :publication-names="publicationNames"
          >
            <template #header>
              {{
                $t(
                  'Send us photos of magazine edges and earn up to {0} Edge photographer points per edge!',
                  [mostPopularIssuesInCollectionWithoutEdge[0].popularity]
                )
              }}
            </template>
            <template #footer>
              <b-button to="/upload">{{ $t('Send edge photos') }}</b-button>
            </template>
          </UploadableEdgesCarousel>
          <b-button v-else to="/upload">{{ $t('Send edge photos') }}</b-button>
        </template>
      </b-container>

      <b-container v-role:unless="'display'" class="mt-5" align="center">
        <b-button to="/edit/new">{{ $t('Create or edit an edge model') }}</b-button>
      </b-container>

      <hr />

      <template v-for="{ status, l10n } in edgeCategories">
        <h3 :key="`${status}-title`">{{ $t(l10n) }}</h3>

        <b-container :key="status">
          <b-row v-if="getEdgesByStatus(status).length">
            <b-col
              v-for="(edge, i) in getEdgesByStatus(status)"
              :key="`${status}-${i}`"
              align-self="center"
              cols="12"
              md="6"
              lg="3"
            >
              <b-card class="text-center">
                <b-link
                  :to="`edit/${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                  :disabled="
                    $gates.hasRole('display') ||
                    (!$gates.hasRole('admin') && status === 'ongoing by another user')
                  "
                >
                  <b-card-text v-if="publicationNames[`${edge.country}/${edge.magazine}`]">
                    <img
                      v-if="edge.v3 || status === 'pending'"
                      :alt="`${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                      class="edge-preview"
                      :src="
                        edge.v3
                          ? getEdgeUrl(edge.country, edge.magazine, edge.issuenumber, 'svg', false)
                          : getPhotoUrl(edge.country, edge.photo)
                      "
                    /><EdgeLink
                      :publicationcode="`${edge.country}/${edge.magazine}`"
                      :issuenumber="edge.issuenumber"
                      :designers="edge.designers"
                      :photographers="edge.photographers"
                      :v3="edge.v3"
                      :published="edge.published === 'Published'"
                    />
                  </b-card-text>
                </b-link>
              </b-card>
            </b-col>
          </b-row>
          <div v-else align="center">{{ $t('No edge in this category') }}</div>
        </b-container>
      </template>
    </template>

    <b-container align="center" class="m-5">&nbsp;</b-container>

    <b-container id="footer" class="position-fixed text-center w-100 bg-light p-2"
      >{{ $t('EdgeCreator is a tool allowing to create edges for the DucksManager bookcase.')
      }}<br /><a href="https://ducksmanager.net">{{ $t('Go to DucksManager') }}</a></b-container
    >
  </div>
</template>

<script>
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import EdgeLink from '@/components/EdgeLink'
import redirectMixin from '@/mixins/redirectMixin'
import SessionInfo from '@/components/SessionInfo'
import UploadableEdgesCarousel from 'ducksmanager/assets/js/components/UploadableEdgesCarousel.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  components: {
    SessionInfo,
    EdgeLink,
    UploadableEdgesCarousel,
  },
  mixins: [edgeCatalogMixin, redirectMixin],
  middleware: 'authenticated',

  data: () => ({
    isUploadableEdgesCarouselReady: false,
  }),

  computed: {
    ...mapState('user', ['userPhotographerPoints']),
    ...mapState('collection', ['bookcase']),
    ...mapGetters('collection', ['popularIssuesInCollectionWithoutEdge']),

    mostPopularIssuesInCollectionWithoutEdge() {
      const popularIssuesInCollectionWithoutEdge = this.popularIssuesInCollectionWithoutEdge
      return (
        popularIssuesInCollectionWithoutEdge &&
        popularIssuesInCollectionWithoutEdge
          .sort(
            ({ popularity: popularity1 }, { popularity: popularity2 }) => popularity2 - popularity1
          )
          .filter((_, index) => index < 10)
      )
    },
  },

  async mounted() {
    await this.fetchUserPoints()
    await this.loadPopularIssuesInCollection()
    await this.loadBookcase()
    await this.fetchPublicationNames(
      this.bookcase.map(({ countryCode, magazineCode }) => `${countryCode}/${magazineCode}`)
    )
    this.isUploadableEdgesCarouselReady = true
  },

  methods: {
    ...mapActions('user', ['fetchUserPoints']),
    ...mapActions('collection', ['loadPopularIssuesInCollection', 'loadBookcase']),
    getPhotoUrl: (country, fileName) => `${process.env.EDGES_URL}/${country}/photos/${fileName}`,
  },
}
</script>
<style scoped lang="scss">
::v-deep .carousel {
  * {
    line-height: 10px;
    font-size: 11px !important;
  }
}
.card {
  margin: 15px 0;

  .edge-preview {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }
}
.disabled {
  pointer-events: none;
}

#footer {
  bottom: 0;
  max-width: 100%;
}
</style>
