<template>
  <div v-if="total > 0">
    <div>{{ l10n.POSSESSION_MAGAZINES_INTRO }} <b>{{ total }}</b> {{ l10n.NUMEROS }}.</div>
    <div>
      {{ l10n.POSSESSION_MAGAZINES_2 }} <b>{{ Object.keys(totalPerPublication).length }}</b> {{
        l10n.POSSESSION_MAGAZINES_3
      }}
      <b>{{ Object.keys(totalPerCountry).length }}</b> {{ l10n.PAYS }}.
    </div>
    <slot name="non-empty-collection" />
  </div>
  <div v-else>
    {{ l10n.COLLECTION_VIDE_1 }}
    <slot name="empty-collection" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";
import collectionMixin from "../mixins/collectionMixin";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "ShortStats",
  mixins: [collectionMixin, l10nMixin],

  data: () => ({
    hasPublicationNames: false,
    rarityRank: null
  }),

  computed: {
    ...mapGetters("collection", ["total", "totalPerCountry", "totalPerPublication"])
  },
};
</script>

<style scoped>

</style>
