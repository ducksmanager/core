<template>
  <div>
    {{
      $t(
        "Remplissez les informations ci-dessous pour que DucksManager détermine le nouveau magazine pour lequel vous souhaitez ajouter des numéros."
      )
    }}
    <PublicationSelect />
    <br />
    <br />
    {{
      $t(
        "... ou recherchez un magazine à partir d'une histoire qui le contient :"
      )
    }}
    <IssueSearch />
  </div>
</template>

<script setup>
</script>

<style scoped>

</style>
