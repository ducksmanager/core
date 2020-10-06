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

<style lang="scss">
#content {
  padding: 45px 20px 20px 20px;
  min-height: 500px;
}

a {
  border-bottom: 1px dotted #ffffff;
}

a, a:hover, a:focus {
  color: inherit;
  text-decoration: inherit;
}
</style>