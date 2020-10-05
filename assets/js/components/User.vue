<template>
  <span class="username">User {{ id }}</span>
</template>

<script>
export default {
  name: "User",
  props: {
    id: {type: Number, required: true}
  }
}
</script>

<style scoped>
  .username {
    font-weight: bold;
    font-style: italic;
  }
</style>