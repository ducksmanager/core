<template>
  <div>
    <h1>{{ $t('Dashboard') }}</h1>

    <b-alert v-if="!isCatalogLoaded" show variant="info">{{ $t('Loading...') }}</b-alert>

    <template v-for="{ status, l10nKey } in edgeCategories" v-else>
      <h3 :key="`${status}-title`">{{ $t(l10nKey) }}</h3>

      <b-container :key="status">
        <b-row v-if="getEdgesByStatus(status).length">
          <b-col
            v-for="(edge, i) in getEdgesByStatus(status)"
            :key="`${status}-${i}`"
            cols="3"
            align-self="center"
          >
            <b-card class="text-center">
              <b-link
                :to="`edit/${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                :disabled="
                  $gates.hasRole('display') ||
                  (status === 'ongoing_by_other_user' && !$gates.hasRole('admin'))
                "
              >
                <b-card-text v-if="publicationNames[`${edge.country}/${edge.magazine}`]">
                  <img
                    v-if="edge.v3 || status === 'pending'"
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
                  />
                </b-card-text>
              </b-link>
            </b-card>
          </b-col>
        </b-row>
        <div v-else align="center">{{ $t('No edge in this category') }}</div>
      </b-container>
    </template>

    <hr />

    <b-container v-role:unless="'viewer'" class="mb-3" align="center">
      <b-button to="/edit/new">{{ $t('Create or edit an edge model') }}</b-button>
    </b-container>

    <b-container align="center">
      <b-button to="/upload-multiple">{{ $t('Send edge photos') }}</b-button>
    </b-container>
  </div>
</template>

<script>
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import EdgeLink from '@/components/EdgeLink'
import redirectMixin from '@/mixins/redirectMixin'

export default {
  components: {
    EdgeLink,
  },
  mixins: [edgeCatalogMixin, redirectMixin],
  middleware: 'authenticated',

  methods: {
    getPhotoUrl: (country, fileName) => `${process.env.EDGES_URL}/${country}/photos/${fileName}`,
  },
}
</script>
<style scoped lang="scss">
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
</style>
