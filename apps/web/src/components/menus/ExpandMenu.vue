<template>
  <Menu
    :title="$t('Agrandir ma collection')"
    root-path="/expand"
    default-path="/suggestions"
    :items="[
      { path: '/suggestions', text: $t('Suggestions') },
      { path: '/marketplace', text: $t('Marketplace'), isNew: true },
    ]"
  />
</template>
