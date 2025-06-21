<template>
  <div :class="{ ...classes, small }">
    <router-link :to="user ? '/collection/show' : '/'">
      <img :src="getImagePath('logo_small.png')" alt="DucksManager" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
const { classes = {}, small = false } = defineProps<{
  classes?: { [key: string]: boolean };
  small?: boolean;
}>();

const { user } = storeToRefs(collection());
const { getImagePath } = images();
</script>

<style scoped lang="scss">
div {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 180px;

  &.small {
    img {
      height: 50px;
      top: 0;
      position: fixed;
      right: 10px;
    }
  }

  a {
    position: absolute;
    border-bottom: none;

    &:hover {
      border-bottom: 0 !important;
    }
  }
}
</style>
