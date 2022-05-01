<template>
  <b-dropdown
    id="language-navbar"
    class="position-fixed"
    variant="outline-secondary"
    boundary="viewport"
  >
    <template #button-content>
      <b-icon-flag-fill />
    </template>
    <b-dropdown-item
      v-for="(title, possibleLocale) in availableLocales"
      :key="possibleLocale"
      :active="locale === possibleLocale"
      @click="changeLocale(possibleLocale)"
    >
      {{ title }}
    </b-dropdown-item>
  </b-dropdown>
</template>
<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'
import { BIconFlagFill } from 'bootstrap-vue'

const availableLocales = {
  fr: 'Français',
  en: 'English',
}

const { locale } = useI18n()
if (localStorage.getItem('locale')) {
  locale.value = localStorage.getItem('locale')!
}

const changeLocale = (newLocale: string) => {
  locale.value = newLocale
  window.localStorage.setItem('locale', newLocale)
}
</script>
<style lang="scss">
$navbar-height: 40px;

@media (max-width: 767px) {
}
</style>
