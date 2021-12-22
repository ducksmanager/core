<template>
  <b-card-group deck>
    <b-card
      v-for="(label, url) in cards"
      :key="url"
      :title="label"
      img-src="https://picsum.photos/600/300/?image=25"
      :img-alt="label"
      img-top
      align="center"
      @click="$router.push(`/start/${url}`)"
    />
  </b-card-group>
</template>

<script setup>
const cards = {
  againstBot: 'Play against a bot',
  againstHumans: 'Play against humans',
}
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
}
</style>
