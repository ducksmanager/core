<route lang="yaml">
alias:
  - /collection
  - /collection/show
</route>
<template>
  <Manage
    :publicationcode="$route.params.all"
  />
</template>
