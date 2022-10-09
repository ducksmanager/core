<route lang="yaml">
alias:
  - /collection/afficher
</route>
<template>
  <Manage
    :publicationcode="$route.params.all || null"
  />
</template>
