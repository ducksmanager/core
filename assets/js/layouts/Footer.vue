<template>
  <div id="footer">
    <div
      v-show="count"
      id="user-count"
      v-html="$t('UTILISATEURS_INSCRITS', [count])"
    />
    <div>
      {{ l10n.REMERCIEMENT_LOGO }}
      <br><br>
      {{ l10n.LICENCE_INDUCKS1 }}
      <a
        target="_blank"
        href="http://coa.inducks.org/inducks/COPYING"
      >{{ l10n.LICENCE_INDUCKS2 }}</a>
      <br>
      {{ l10n.LICENCE_INDUCKS3 }}
    </div>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import { mapActions, mapState } from "vuex";

export default {
  name: "Footer",
  mixins: [l10nMixin],
  computed: {
    ...mapState("users", ["count"])
  },

  async mounted() {
    await this.fetchCount()
  },

  methods: {
    ...mapActions("users", ["fetchCount"])
  }
}
</script>

<style scoped lang="scss">
#footer {
  height: 125px;
  border-top: 1px solid white;
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  > * {
    text-align: center;
  }
}

#user-count {
  text-align: center;
  vertical-align: middle;
  padding-left: 4px;
}

</style>
