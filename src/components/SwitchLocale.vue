<template>
  <div id="flags" :class="{ fixed }">
    <img
      v-for="locale in locales"
      :key="locale.key"
      class="flag"
      :src="`/images/flags/xl/${locale.flagName}.png`"
      :alt="locale.name"
      @click="reloadWithLocale(locale)"
    >
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
defineProps({
  fixed: {
    type: Boolean,
    default: false,
  },
})

const i18n = useI18n()

const locales = [
  {
    key: 'en',
    name: 'English',
    flagName: 'uk',
  },
  {
    key: 'fr',
    name: 'Français',
    flagName: 'fr',
  },
]
const reloadWithLocale = ({ key }) => {
  localStorage.setItem('locale', key)
  i18n.locale.value = key
}
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
