<template>
  <Menu
    :title="$t('Gérer ma collection')"
    root-path="collection"
    default-path="/show"
    :items="items"
  />
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { collection } from '~/stores/collection'
import { user } from '~/composables/global'

const { username } = user()

const { t: $t } = useI18n()
const items = $computed(() => [
  {
    path: '/show',
    text:
        total == null ? $t('Mes numéros') : $t('Mes numéros ({0})', [total]),
  },
  {
    path: '/duplicates',
    text:
        totalUniqueIssues == null
          ? $t('Mes numéros en double')
          : $t('Mes numéros en double ({0})', [total - totalUniqueIssues]),
  },
  {
    path: '/to-read',
    text:
        issuesInToReadStack == null
          ? $t('Mes numéros à lire')
          : $t('Mes numéros à lire ({0})', [issuesInToReadStack.length]),
  },
  {
    path: '/subscriptions',
    text:
        subscriptions == null
          ? $t('Mes abonnements')
          : $t('Mes abonnements ({0})', [subscriptions.length]),
  },
  { path: '/account', text: $t('Mon compte'), disabled: username === 'demo' },
])
const subscriptions = $computed(() => collection().subscriptions)
const issuesInToReadStack = $computed(() => collection().issuesInToReadStack)
const total = $computed(() => collection().total)
const totalUniqueIssues = $computed(() => collection().totalUniqueIssues)
const loadSubscriptions = collection().loadSubscriptions

onMounted(() => {
  loadSubscriptions()
})
</script>
