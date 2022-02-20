<template>
  <div class="d-flex flex-column align-items-center text-center">
    <div>
      <b-avatar
        v-if="isAnonymous"
        :class="{ 'top-player': topPlayer }"
        size="4rem"
        src="/anonymous.png"
      />
    </div>
    <div>{{ shownUsername }}</div>
  </div>
</template>

<script setup lang="ts">
const { username: shownUsername } = withDefaults(
  defineProps<{
    username: string | null
    topPlayer: boolean
  }>(),
  {
    topPlayer: false,
  }
)

const isAnonymous = true
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
