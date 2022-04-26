<template>
  <div>
    <div v-if="$attrs['bookcase-username'] && $attrs['bookcase-username'] !== username">
      <h5><b>{{ $t('Bibliothèque DucksManager de') }} {{ $attrs['bookcase-username'] }}</b></h5>
      <ViewBookcase v-bind="attrsWithoutTab" />
    </div>
    <template v-else>
      <Menu
        :title="$t('Ma bibliothèque')"
        :root-path="'/bookcase'"
        :default-path="'/show'"
        :items="[
          {path: '/show', text: $t('Ma bibliothèque')},
          {path: '/options', text: $t('Options de la bibliothèque')},
          {path: '/contributors', text: $t('Contributeurs')}
        ]"
      />
      <component
        :is="tab"
        v-bind="attrsWithoutTab"
      />
    </template>
  </div>
</template>

<script setup>
import ViewBookcase from "./bookcase/ViewBookcase";
import Menu from "./Menu";
import {user} from "../composables/global";
import {computed, useAttrs} from "vue";

const {username} = user()
const attrs = useAttrs()

defineProps({
  tab: {
    type: String,
    required: true
  }
})

const attrsWithoutTab = computed(() => Object.keys(attrs).filter(attrKey => attrKey !== 'tab')
    .reduce((acc, attrKey) => ({...acc, [attrKey]: attrs[attrKey]}), {}))
</script>

<style scoped lang="scss">
</style>
