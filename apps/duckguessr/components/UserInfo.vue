<template>
  <div class="d-flex flex-column align-items-center text-center">
    <div>
      <b-avatar v-if="isAnonymous" size="4rem" src="/anonymous.png" />
    </div>
    <div>{{ shownUsername }}</div>
  </div>
</template>

<script setup lang="ts">
const { username: shownUsername } = defineProps<{
  username: string | null
}>()

const isAnonymous = true
</script>
