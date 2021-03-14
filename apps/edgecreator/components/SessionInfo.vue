<template>
  <div class="user-and-locale m-2">
    <div class="text-right font-weight-bold">{{ $cookies.get('dm-user') }}</div>
    <template v-for="({ code, name }, idx) in $i18n.locales">
      <template v-if="idx > 0"> |</template>
      <span v-if="$i18n.locale === code" :key="code">{{ name }}</span>
      <nuxt-link v-else :key="code" :to="switchLocalePath(code)">{{ name }}</nuxt-link>
    </template>
  </div>
</template>
<script>
export default {
  name: 'SessionInfo',
}
</script>
<style lang="scss">
.user-and-locale {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
