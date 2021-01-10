<template>
  <ShortStats v-if="rarityTotal">
    <template #non-empty-collection>
      <div>
        <span v-html="$t('RARETE_TEXTE', [rarityValue, rarityTotal])" /><br>
        <small class="d-inline-block mt-3">{{ l10n.RARETE_EXPLICATION }}</small>
      </div>
    </template>
  </ShortStats>
  <div v-else>
    {{ l10n.LOADING }}
  </div>
</template>

<script>
import ShortStats from "../../components/ShortStats";
import axios from "axios";
import l10nMixin from "../../mixins/l10nMixin";
import { mapActions, mapState } from "vuex";

export default {
  name: "GeneralStats",
  components: { ShortStats },
  mixins: [l10nMixin],

  data: () => ({
    rarityValue: null,
    rarityTotal: null
  }),

  computed: {
    ...mapState("users", ["count"])
  },

  async mounted() {
    await this.fetchCount()
    const { userScores, myScore } =  (await axios.get(`/global-stats/user/collection/rarity`)).data;
    this.rarityValue = userScores.length - userScores.indexOf(myScore)
    this.rarityTotal = this.count
  },

  methods: {
    ...mapActions("users", ["fetchCount"])
  }
}
</script>

<style scoped>
::v-deep div {
  font-size: 16px;
  margin-bottom: 32px;
}
</style>
