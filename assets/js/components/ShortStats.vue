<template>
  <div v-if="total > 0">
    <div>{{ $t('Vous possédez') }} <b>{{ total }}</b> {{ $t('numéros') }}.</div>
    <div>
      {{ $t('Votre collection est composée de') }} <b>{{ Object.keys(totalPerPublication).length }}</b> {{
        $t('magazines différents issus de')
      }}
      <b>{{ Object.keys(totalPerCountry).length }}</b> {{ $t('pays') }}.
    </div>
    <slot name="non-empty-collection" />
  </div>
  <div v-else>
    {{ $t('Votre collection est vide.') }}
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
