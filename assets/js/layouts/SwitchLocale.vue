<template>
  <div id="flags" :class="{ fixed }">
    <img
      v-for="locale in locales"
      :key="locale.key"
      class="flag"
      :src="`${imagePath}/flags/xl/${locale.flagName}.png`"
      :alt="locale.name"
      @click="reloadWithLocale(locale)"
    />
  </div>
</template>
<script>
export default {
  name: "SwitchLocale",

  props: {
    fixed: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    locales: [
      {
        key: "en",
        name: "English",
        flagName: "uk",
      },
      {
        key: "fr",
        name: "Français",
        flagName: "fr",
      },
    ],
  }),

  methods: {
    reloadWithLocale({ key: locale }) {
      localStorage.setItem("locale", locale);
      this.$i18n.locale = locale;
    },
  },
};
</script>
<style scoped lang="scss">
#flags {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 50;
  background: inherit;
  padding: 8px;
  cursor: pointer;

  &.fixed {
    position: fixed;
    right: 165px;
  }
}
</style>
