<template>
  <b-dropdown
    id="language-navbar"
    variant="outline-secondary"
    boundary="viewport"
  >
    <template #button-content>
      <i-bi-globe2 />
    </template>
    <div
      v-for="{ code, label } in availableLocales"
      :key="code"
      class="mx-2"
      @click.prevent="changeLocale(code)"
    >
      <a
        href="javascript:void(0)"
        :class="{ active: i18n.locale.value === code }"
      >
        {{ label }}
      </a>
    </div>
  </b-dropdown>
</template>
<script setup lang="ts">
const availableLocales = [
  {
    code: "fr",
    label: "Français",
  },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

const i18n = useI18n();
if (localStorage.getItem("locale")) {
  i18n.locale.value = localStorage.getItem("locale")!;
}

const changeLocale = (newLocale: string) => {
  i18n.locale.value = newLocale;
  window.localStorage.setItem("locale", newLocale);
};
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
