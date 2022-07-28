<template>
  <b-dropdown
    id="language-navbar"
    class="position-fixed"
    menu-class="mt-4"
    variant="outline-secondary"
    boundary="viewport"
  >
    <template #button-content>
      <b-icon-globe2 />
    </template>
    <div
      v-for="(title, possibleLocale) in availableLocales"
      :key="possibleLocale"
      class="mx-2"
      @click.prevent="changeLocale(possibleLocale)"
    >
      <a href="javascript:void(0)" :class="{ active: i18n.locale.value === possibleLocale }">
        {{ title }}
      </a>
    </div>
  </b-dropdown>
</template>
<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'
import { BIconGlobe2 } from 'bootstrap-vue'

const availableLocales = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
}

const i18n = useI18n()
if (localStorage.getItem('locale')) {
  i18n.locale.value = localStorage.getItem('locale')!
}

const changeLocale = (newLocale: string) => {
  i18n.locale.value = newLocale
  window.localStorage.setItem('locale', newLocale)
}
</script>
<style lang="scss">
$navbar-height: 40px;

#language-navbar button,
.dropdown-menu {
  background: #3d4b5f !important;
}

.dropdown-menu {
  a {
    &.active {
      pointer-events: none;
      color: white !important;
    }
  }
}
</style>
