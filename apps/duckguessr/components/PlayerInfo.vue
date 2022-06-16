<template>
  <div
    class="d-flex flex-column align-items-center justify-content-around text-center"
    :class="{
      opacity50: isPotentialBot(username),
      pointer: isPotentialBot(username) || toggleable,
    }"
    style="height: 100px"
    @click="toggleable ? $emit('toggle') : () => {}"
  >
    <b-avatar :class="{ 'top-player': topPlayer }" size="4rem" :src="src" />
    <div class="username" :class="{ small: isPotentialBot(username) }">
      <template v-if="isBot(username)">
        <div>BOT</div>
        <div v-if="toggleable" class="small">
          {{ t('Click to remove') }}
        </div>
      </template>
      <div v-else-if="isPotentialBot(username)">{{ t('Click to add a bot to the game') }}</div>
      <div v-else>{{ username }}</div>
    </div>
  </div>
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
  }>(),
  {
    topPlayer: false,
    avatar: "HDL's father",
    toggleable: false,
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
  align-items: center;
  height: 1.5rem;
}

.small {
  color: grey;
}

.opacity50 {
  opacity: 0.5;
}

.pointer {
  cursor: pointer;
}
</style>
