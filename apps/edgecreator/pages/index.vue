<template>
  <div v-show="$gates.getRoles().length">
    <session-info />
    <h1>{{ $t('Dashboard') }}</h1>

    <b-alert v-if="!isCatalogLoaded" show variant="info">{{
      $t('Loading...')
    }}</b-alert>

    <template v-else>
      <h3>{{ $t('Edge creation') }}</h3>

      <b-container v-if="isUploadableEdgesCarouselReady" align="center">
        <b-alert show variant="info">
          <template v-if="mostPopularIssuesInCollectionWithoutEdge.length">
            <UploadableEdgesCarousel
              :user-points="userPhotographerPoints"
              :issues="mostPopularIssuesInCollectionWithoutEdge"
              :publication-names="publicationNames"
            >
              <template #header>
                {{
                  $t(
                    'Send us photos of magazine edges that you own and earn up to {0} Edge photographer points per edge!',
                    [mostPopularIssuesInCollectionWithoutEdge[0].popularity]
                  )
                }}
              </template>
            </UploadableEdgesCarousel>
            <div>
              <div class="position-absolute px-2 separation-text">
                {{ $t('or') }}
              </div>
              <hr />
            </div>
          </template>
          <UploadableEdgesCarousel
            :user-points="userPhotographerPoints"
            :issues="mostWantedEdges"
            :publication-names="publicationNames"
          >
            <template #header>
              {{
                $t(
                  'Send us photos of magazine edges that you find on the Internet and earn up to {0} Edge photographer points per edge!',
                  [mostWantedEdges[0].popularity]
                )
              }}
            </template>
          </UploadableEdgesCarousel>
          <b-button to="/upload" class="mt-1">{{
            $t('Send edge photos')
          }}</b-button>
        </b-alert>
      </b-container>

      <b-container v-role:unless="'display'" class="mt-3" align="center">
        <b-button to="/edit/new">{{
          $t('Create or edit an edge model')
        }}</b-button>
      </b-container>

      <hr />

      <template v-for="{ status, l10n } in edgeCategories">
        <h3 :key="`${status}-title`">{{ $t(l10n) }}</h3>

        <b-container
          v-if="Object.keys(edgesByStatus[status]).length"
          :key="`status-${status}`"
        >
          <template v-for="(edges, publicationcode) in edgesByStatus[status]">
            <b-row :key="`${status}-${publicationcode}-title`">
              <b-link
                class="mx-3"
                :to="`edit/${publicationcode} ${edges
                  .map((edge) => edge.issuenumber)
                  .join(',')}`"
                ><b-btn
                  v-if="canEditEdge(status)"
                  size="sm"
                  variant="outline-secondary"
                  >Tout éditer ({{ edges.length }})</b-btn
                ></b-link
              ><Publication
                :publicationname="publicationNames[publicationcode]"
                :publicationcode="publicationcode"
            /></b-row>
            <b-row :key="`${status}-${publicationcode}-edges`">
              <b-col
                v-for="(edge, i) in edges"
                :key="`${status}-${i}`"
                align-self="center"
                cols="12"
                md="6"
                lg="3"
              >
                <b-card class="text-center">
                  <b-link
                    :to="`edit/${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                    :disabled="!canEditEdge(status)"
                  >
                    <b-card-text>
                      <img
                        v-if="edge.v3 || status === 'pending'"
                        :alt="`${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                        class="edge-preview"
                        :src="
                          edge.v3
                            ? getEdgeUrl(
                                edge.country,
                                edge.magazine,
                                edge.issuenumber,
                                'svg',
                                false
                              )
                            : getPhotoUrl(edge.country, edge.photo)
                        "
                      /><EdgeLink
                        :publicationcode="`${edge.country}/${edge.magazine}`"
                        :issuenumber="edge.issuenumber"
                        :designers="edge.designers"
                        :photographers="edge.photographers"
                        :published="edge.published === 'Published'"
                      />
                    </b-card-text>
                  </b-link>
                </b-card>
              </b-col>
            </b-row>
          </template>
        </b-container>
        <div v-else :key="`no-edge-${status}`" align="center">
          {{ $t('No edge in this category') }}
        </div>
      </template>
    </template>

    <b-container align="center" class="m-5">&nbsp;</b-container>

    <b-container
      id="footer"
      class="position-fixed text-center w-100 bg-light p-2"
      >{{
        $t(
          'EdgeCreator is a tool allowing to create edges for the DucksManager bookcase.'
        )
      }}<br /><a href="https://ducksmanager.net">{{
        $t('Go to DucksManager')
      }}</a></b-container
    >
  </div>
</template>

<script>
import UploadableEdgesCarousel from 'ducksmanager/assets/js/components/UploadableEdgesCarousel.vue'
import Publication from 'ducksmanager/assets/js/components/Publication.vue'
import { mapActions, mapState } from 'pinia'
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import EdgeLink from '@/components/EdgeLink'
import redirectMixin from '@/mixins/redirectMixin'
import SessionInfo from '@/components/SessionInfo'
import { collection } from '~/stores/collection'
import { user } from '~/stores/user'

export default {
  components: {
    SessionInfo,
    EdgeLink,
    UploadableEdgesCarousel,
    Publication,
  },
  mixins: [edgeCatalogMixin, redirectMixin],
  middleware: 'authenticated',

  data: () => ({
    isUploadableEdgesCarouselReady: false,
    mostWantedEdges: null,
  }),

  computed: {
    ...mapState(user, ['userPhotographerPoints']),
    ...mapState(collection, [
      'bookcase',
      'popularIssuesInCollectionWithoutEdge',
    ]),

    mostPopularIssuesInCollectionWithoutEdge() {
      const popularIssuesInCollectionWithoutEdge =
        this.popularIssuesInCollectionWithoutEdge
      return (
        popularIssuesInCollectionWithoutEdge &&
        popularIssuesInCollectionWithoutEdge
          .sort(
            ({ popularity: popularity1 }, { popularity: popularity2 }) =>
              popularity2 - popularity1
          )
          .filter((_, index) => index < 10)
      )
    },
  },

  async mounted() {
    await this.fetchUserPoints()
    await this.loadPopularIssuesInCollection()
    await this.loadBookcase()
    await this.loadMostWantedEdges()
    await this.loadCatalog(true)
    await this.fetchPublicationNames([
      ...new Set([
        ...this.bookcase.map(
          ({ countryCode, magazineCode }) => `${countryCode}/${magazineCode}`
        ),
        ...this.mostWantedEdges.map(({ publicationCode }) => publicationCode),
        ...Object.values(this.currentEdges).map(
          ({ country, magazine }) => `${country}/${magazine}`
        ),
      ]),
    ])
    this.isUploadableEdgesCarouselReady = true
  },

  methods: {
    ...mapActions(user, ['fetchUserPoints']),
    ...mapActions(collection, [
      'loadPopularIssuesInCollection',
      'loadBookcase',
    ]),
    getPhotoUrl: (country, fileName) => `/edges/${country}/photos/${fileName}`,

    async loadMostWantedEdges() {
      this.mostWantedEdges = (
        await this.$axios.$get('/wanted-edges')
      ).wantedEdges
        .slice(0, 10)
        .map(({ publicationcode, issuenumber, numberOfIssues }) => ({
          issueCode: `${publicationcode} ${issuenumber}`,
          publicationCode: publicationcode,
          issueNumber: issuenumber,
          popularity: numberOfIssues,
        }))
    },
  },
}
</script>
<style scoped lang="scss">
::v-deep .carousel {
  height: 100px;
  * {
    line-height: 10px;
    font-size: 11px !important;
    a span {
      color: #666;
    }
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

.separation-text {
  margin-top: -12px !important;
  background: #d1ecf1;
  left: 50%;
}

#footer {
  bottom: 0;
  max-width: 100%;
}
</style>
