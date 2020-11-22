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
    <div id="flags">
      <img
        v-for="locale in locales"
        :key="locale.key"
        class="flag"
        :src="`${imagePath}/flags/xl/${locale.flagName}.png`"
        :alt="locale.name"
        @click="reloadWithLocale(locale.key)"
      >
    </div>
  </div>
</template>

<script>
import axios from "axios";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Footer",

  mixins: [l10nMixin],

  data: () => ({
    userCount: null,
    locales: [
      {
        key: 'en',
        name: 'English',
        flagName: 'uk'
      },
      {
        key: 'fr',
        name: 'Français',
        flagName: 'fr'
      }
    ]
  }),

  computed: {
    imagePath: () => window.imagePath
  },

  async mounted() {
    this.userCount = (await axios.get("/global-stats/user/count")).data.count
  },

  methods: {
    reloadWithLocale: async localeKey => {
      await axios.post(`/locale/${localeKey}`)
      window.location.replace(window.location.href)
    }
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
  justify-content: space-between;

  > * {
    text-align: center;
  }
}

#user_count {
  text-align: center;
  vertical-align: middle;
  padding-left: 4px;
}

#flags {
  margin: 20px;
  cursor: pointer;
}
</style>