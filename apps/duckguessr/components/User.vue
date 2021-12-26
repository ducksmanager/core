<template>
  <div class="d-inline-flex flex-column">
    <div class="text-center">
      <b-avatar v-if="isAnonymous" size="4rem" src="/anonymous.png" />
    </div>
    <div>{{ username }}</div>
  </div>
</template>

<script setup lang="ts">
const { username } = defineProps<{
  username: string | null
}>()

const isAnonymous = true
</script>
