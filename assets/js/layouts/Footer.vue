<template>
  <div id="footer">
    <div
      v-show="userCount"
      id="user_count"
      v-html="$t('UTILISATEURS_INSCRITS', [userCount])"
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
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";
import {userCountCache} from "../util/cache";

const api = axios.create({
  adapter: userCountCache.adapter,
})

export default {
  name: "Footer",
  mixins: [l10nMixin],

  data: () => ({
    userCount: null
  }),

  async mounted() {
    this.userCount = (await api.get("/global-stats/user/count")).data.count
  },
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

#user_count {
  text-align: center;
  vertical-align: middle;
  padding-left: 4px;
}

</style>