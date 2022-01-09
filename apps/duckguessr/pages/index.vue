<template>
  <div>
    <b-alert v-if="isAnonymous" show variant="warning">
      You are not connected. You can still play but you won't keep any won
      medals.
    </b-alert>
    <b-card-group deck>
      <b-card
        v-for="(label, url) in cards"
        :key="url"
        :title="label"
        img-src="https://picsum.photos/600/300/?image=25"
        :img-alt="label"
        img-top
        align="center"
        @click="$router.push(`/setup/${url}`)"
      />
    </b-card-group>
  </div>
</template>

<script setup>
import { getUser } from '@/components/user'

const { isAnonymous } = getUser()
const cards = {
  'published-fr-recent': 'Stories from recent French publications',
  us: 'US artists',
}
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
}
</style>
