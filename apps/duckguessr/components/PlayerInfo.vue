<template>
  <b-row
    class="flex-row align-items-center justify-content-around text-center flex-grow-1"
    :class="{
      opacity50: isPotentialBot(username),
      pointer: isPotentialBot(username) || toggleable,
    }"
    :style="{ height: `${size + 1}rem`, 'font-size': `${1 - 0.1 * (4 - size)}rem` }"
    @click="toggleable ? $emit('toggle') : () => {}"
  >
    <b-col cols="6" class="px-0 d-flex flex-column align-items-center justify-content-center">
      <b-avatar :class="{ 'top-player': topPlayer }" :size="`${size}rem`" :src="src" />
      <div class="username" :style="nowrap ? 'overflow: auto' : ''">
        <div v-if="isBot(username) || isPotentialBot(username)" :class="{ 'text-nowrap': nowrap }">
          BOT
        </div>
        <div v-else :class="{ 'text-nowrap': nowrap }">{{ username }}</div>
      </div>
    </b-col>
    <b-col
      v-if="!noRightPanel"
      cols="6"
      class="px-0 d-flex align-items-center justify-content-center h-100"
    >
      <div v-if="isBot(username) && toggleable">
        {{ t('Click to remove the bot') }}
      </div>
      <div v-else-if="isPotentialBot(username)">{{ t('Click to add a bot to the game') }}</div>
      <slot v-else />
    </b-col>
  </b-row>
</template>

<script setup lang="ts">
import { useI18n } from 'nuxt-i18n-composable'
import { computed } from '@nuxtjs/composition-api'
import { isBot, isPotentialBot } from '~/composables/user'

const props = withDefaults(
  defineProps<{
    username: string
    topPlayer: boolean
    avatar: string
    toggleable: boolean
    size: number
    noRightPanel: boolean
    nowrap: boolean
  }>(),
  {
    topPlayer: false,
    avatar: "HDL's father",
    toggleable: false,
    size: 4,
    noRightPanel: false,
    nowrap: true,
  }
)

defineEmits(['toggle'])

const src = computed(() =>
  isBot(props.username) || isPotentialBot(props.username)
    ? '/avatars/Little Helper.png'
    : `/avatars/${props.avatar}.png`
)

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
  display: flex;
  flex-direction: column;
  max-width: 100%;
  align-items: stretch;
  height: 1.5rem;
  font-size: small;
}

.opacity50 {
  opacity: 0.5;
}

.pointer {
  cursor: pointer;
}
</style>
