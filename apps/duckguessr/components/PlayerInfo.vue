<template>
  <div class="d-flex flex-column align-items-center text-center">
    <b-avatar :class="{ 'top-player': topPlayer }" size="4rem" :src="src" />
    <div>{{ isBot ? 'BOT' : username }}</div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    username: string
    topPlayer: boolean
  }>(),
  {
    topPlayer: false,
  }
)

const isBot = /^bot_/.test(props.username)

const src = isBot ? '/little-helper.png' : '/anonymous.png'
</script>

<style lang="scss">
.b-avatar {
  max-width: initial;
  &.top-player:after {
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
}
</style>
