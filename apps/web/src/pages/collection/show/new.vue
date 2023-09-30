<route lang="yaml">
alias:
  - /collection/afficher/new
</route>
<template>
  {{
    $t(
      "Remplissez les informations ci-dessous pour que DucksManager détermine le nouveau magazine pour lequel vous souhaitez ajouter des numéros.",
    )
  }}
  <PublicationSelect />
  <div class="mt-5 mb-2">
    {{
      $t(
        "... ou recherchez un magazine à partir d'une histoire qui le contient :",
      )
    }}
  </div>
  <StorySearch />
</template>
