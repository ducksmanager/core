<template>
  <Menu
    :title="$t('Agrandir ma collection')"
    root-path="expand"
    default-path="/suggestions"
    :items="[
      { path: '/suggestions', text: $t('Suggestions') },
      { path: '/on-sale', text: $t('A vendre') },
    ]"
  />
</template>
