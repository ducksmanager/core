<template>
  <div>
    <h1>{{ $t('Dashboard') }}</h1>

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
              <b-link
                :to="`edit/${edge.country}/${edge.magazine}/${edge.issuenumber}`"
                :disabled="
                  $gates.hasRole('display') ||
                  (category === 'ongoing_by_other_user' && !$gates.hasRole('admin'))
                "
              >
                <b-card-text v-if="publicationNames[`${edge.country}/${edge.magazine}`]"
                  ><EdgeLink
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

    <b-container v-role:unless="'viewer'" align="center" style="margin-bottom: 20px">
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

  data: () => ({
    edgeCategories: [
      {
        category: 'ongoing',
        l10nKey: 'Ongoing edges',
      },
      {
        category: 'pending',
        l10nKey: 'Pending edges',
      },
      {
        category: 'ongoing_by_other_user',
        l10nKey: 'Ongoing edges handled by other users',
      },
    ],
  }),
}
</script>
<style scoped lang="scss">
.card {
  margin: 15px 0;
}
.disabled {
  pointer-events: none;
}
</style>
