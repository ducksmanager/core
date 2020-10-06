<template>
  <div
    v-if="l10n"
    id="footer"
  >
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
      <a
        v-for="locale in locales"
        :key="locale.key"
        class="flag"
        :href="getLocalizedUrl(locale.key)"
      >
        <img
          :src="`${imagePath}/flags/xl/${locale.flagName}.png`"
          :alt="locale.name"
        >
      </a>
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
    this.userCount = (await axios.get("/stats/user/count")).data.count
  },

  methods: {
    getLocalizedUrl: localeKey => {
      const params = new URLSearchParams(window.location.search)
      params.set('locale', localeKey)
      return window.location.href.replace(/(\?|$).*$/, `?${params.toString()}`)
    }
  }
}
</script>

<style scoped lang="scss">
#footer {
  border-top: 1px solid white;
  padding: 10px 10px 10px 30px;
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

  a.flag,
  a.flag:HOVER,
  a img {
    border: 0 !important;
  }
}
</style>