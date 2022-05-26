<template>
  <div
    class="d-flex flex-column align-items-center justify-content-around text-center"
    :class="{ opacity50: isPotentialBot, pointer: isPotentialBot }"
    style="height: 100px"
    @click="$emit('click')"
  >
    <b-avatar :class="{ 'top-player': topPlayer }" size="4rem" :src="src" />
    <div class="username" :class="{ small: isPotentialBot }">
      <template v-if="isBot">BOT</template>
      <template v-else-if="isPotentialBot">{{ t('Click to add a bot to the game') }}</template>
      <template v-else>{{ username }}</template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'

const props = withDefaults(
  defineProps<{
    username: string
    topPlayer: boolean
  }>(),
  {
    topPlayer: false,
  }
)

defineEmits(['click'])

const isBot = /^bot_/.test(props.username)
const isPotentialBot = props.username === 'potential_bot'

const src = isBot || isPotentialBot ? '/little-helper.png' : '/anonymous.png'

const { t } = useI18n()
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

.username {
  height: 1rem;
}

.opacity50 {
  opacity: 0.5;
}

.pointer {
  cursor: pointer;
}
</style>
