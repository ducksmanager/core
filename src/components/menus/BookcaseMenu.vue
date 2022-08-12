<template>
  <Menu
    :title="$t('Ma bibliothèque')"
    root-path="bookcase"
    default-path="/show"
    :items="[
      { path: '/show', text: $t('Ma bibliothèque') },
      { path: '/options', text: $t('Options de la bibliothèque') },
      { path: '/contributors', text: $t('Contributeurs') },
    ]"
  />
</template>
