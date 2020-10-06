<template>
  <div id="content">
    <slot />
  </div>
</template>

<script>
export default {
  name: "Content"
}
</script>

<style scoped>
#content {
  padding: 45px 20px 20px 20px;
  min-height: 500px;
}
</style>