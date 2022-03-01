<template>
  <div class="d-flex flex-column align-items-center text-center">
    <div>
      <b-avatar :class="{ 'top-player': topPlayer }" size="4rem" src="/anonymous.png" />
    </div>
    <div>{{ username }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isAnonymous: boolean
    username: string | null
    topPlayer: boolean
  }>(),
  {
    topPlayer: false,
    isAnonymous: false,
  }
)
</script>

<style lang="scss">
.b-avatar.top-player:after {
  position: absolute;
  top: -25px;
  right: -10px;
  content: ' ';
  width: 50px;
  height: 50px;
  transform: rotate(20deg);
  background: url('/hat.png') no-repeat;
  background-size: contain;
}
</style>
