<template>
  <b-row
    class="flex-row align-items-center justify-content-around text-center flex-grow-1"
    :class="{
      opacity50: isPotentialBot(username),
      pointer: isPotentialBot(username) || toggleable,
    }"
    :style="{
      height: `${size + 1}rem`,
      'font-size': `${1 - 0.1 * (4 - size)}rem`,
    }"
    @click="toggleable ? emit('toggle') : () => {}"
  >
    <div
      class="px-0 d-flex flex-column align-items-center justify-content-center"
    >
      <div class="ring-wrapper" :class="{ 'hasnt-played': !hasPlayed }">
        <b-avatar
          class="position-absolute ring"
          :size="`${size + 0.5}rem`"
          :style="{
            '--ring-color': ringColorVar,
            background: `conic-gradient(
            var(--ring-color) 0% ${percentFilled}%,
            #ddd ${percentFilled}% 100%
          )`,
          }"
        />
      </div>
      <b-avatar
        :class="{ 'top-player': topPlayer }"
        :size="`${size}rem`"
        :src="src"
      />
      <div class="username" :style="nowrap ? 'overflow: auto' : ''">
        <div v-if="isPotentialBotUser">{{ $t("Add a bot") }}</div>
        <div v-else-if="isBotUser">BOT</div>
        <div v-else :class="{ 'text-nowrap': nowrap }">{{ username }}</div>
      </div>
      <slot name="cards" />
    </div>
  </b-row>
</template>

<script setup lang="ts">
import { isBot, isPotentialBot } from "~/composables/user";

const {
  username,
  avatar,
  topPlayer = false,
  toggleable = false,
  size = 4,
  nowrap = true,
} = defineProps<{
  username: string;
  topPlayer?: boolean;
  avatar?: string;
  toggleable?: boolean;
  size?: number;
  nowrap?: boolean;
}>();

const hasPlayed = defineModel<boolean>("hasPlayed", { required: true });

const isBotUser = computed(() => isBot(username));
const isPotentialBotUser = computed(() => isPotentialBot(username));

defineSlots<{
  cards: () => VNode[];
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
}>();

const percentFilled = ref(100);

const ringColorVar = computed(() => {
  if (percentFilled.value < 30) return "var(--ring-red)";
  if (percentFilled.value < 70) return "var(--ring-orange)";
  return "var(--ring-green)";
});

const src = computed(() =>
  isBotUser.value || isPotentialBotUser.value
    ? "/avatars/Little Helper.png"
    : `/avatars/${avatar}.png`,
);
</script>

<style lang="scss">
@import "../../styles/progress.scss";
@import "../../styles/main.scss";

.b-avatar {
  z-index: 1;
  max-width: initial;
  &.top-player:after {
    position: absolute;
    top: -25px;
    right: -10px;
    content: " ";
    width: 50px;
    height: 50px;
    transform: rotate(20deg);
    background: url("/hat.png") no-repeat;
    background-size: contain;
  }

  &.ring {
    top: -0.25rem;
  }
}

.username {
  display: flex;
  flex-direction: column;
  max-width: #{$username-max-width};
  align-items: stretch;
  font-size: small;
  border: 2px solid black;
  background-color: lightgray;
  margin-top: -0.5rem;
  padding: 0.5rem;
  text-transform: uppercase;
  font-weight: bold;
  font-style: italic;
  font-family: "Comic Sans MS", cursive;
  letter-spacing: 0.1em;
}

.opacity50 {
  opacity: 0.5;
}

.pointer {
  cursor: pointer;
}
</style>
