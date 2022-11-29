<template>
  <Menu
    :title="$t('Statistiques de ma collection')"
    root-path="/stats"
    default-path="/general"
    :items="[
      { path: '/general', text: $t('Général') },
      { path: '/publications', text: $t('Publications') },
      { path: '/possessions', text: $t('Possessions') },
      { path: '/conditions', text: $t('Etats des numéros') },
      { path: '/purchases', text: $t('Achats') },
      { path: '/authors', text: $t('Auteurs') },
    ]"
  />
</template>
