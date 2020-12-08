<template>
  <div>
    <h1>{{ $t('header.dashboard') }}</h1>

    <template v-for="{ category, l10nKey } in edgeCategories">
      <h3 :key="`${category}-title`">{{ $t(l10nKey) }}</h3>

      <b-container :key="category">
        <b-row v-if="getEdgesByStatus(category).length">
          <b-col
            v-for="(edge, i) in getEdgesByStatus(category)"
            :key="`${category}-${i}`"
            cols="3"
            align-self="center"
          >
            <b-card class="text-center">
              <b-link :to="`edit/${edge.country}/${edge.magazine}/${edge.issuenumber}`">
                <b-card-text v-if="hasPublicationNames"
                  ><Issue
                    :publicationcode="`${edge.country}/${edge.magazine}`"
                    :publicationname="
                      publications[edge.country][`${edge.country}/${edge.magazine}`]
                    "
                    :issuenumber="edge.issuenumber"
                    hide-condition
                  /><b-badge v-if="edge.v3">v3</b-badge></b-card-text
                >
              </b-link>
            </b-card>
          </b-col>
        </b-row>
        <div v-else align="center">{{ $t('no_edges_in_category') }}</div>
      </b-container>
    </template>

    <hr />

    <b-container align="center" style="margin-bottom: 20px">
      <b-button to="/upload">{{ $t('button.send_photos') }}</b-button>
    </b-container>

    <b-container align="center">
      <b-button to="/edit/new">{{ $t('button.create_or_update') }}</b-button>
    </b-container>
  </div>
</template>

<script>
import edgeCatalogMixin from '@/mixins/edgeCatalogMixin'
import Issue from 'ducksmanager/assets/js/components/Issue.vue'

export default {
  components: {
    Issue,
  },
  mixins: [edgeCatalogMixin],
  middleware: 'authenticated',

  data: () => ({
    edgeCategories: [
      {
        category: 'ongoing',
        l10nKey: 'header.ongoing_edges',
      },
      {
        category: 'pending',
        l10nKey: 'header.pending_edges',
      },
      {
        category: 'ongoing_by_other_user',
        l10nKey: 'header.ongoing_by_other_user_edges',
      },
    ],
  }),

  mounted() {
    window.imagePath = '/images/'
  },
}
</script>
<style scoped lang="scss">
.card {
  margin: 15px 0;
}
.clickable {
  cursor: pointer;
}
</style>
