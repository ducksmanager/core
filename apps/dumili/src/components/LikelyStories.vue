<template>
  <aside class="likely">
    <h6 class="heading">{{ $t("Actuellement les plus probables") }}</h6>
    <ul class="list">
      <li
        v-for="story in stories"
        :key="story.storycode"
        class="entry"
        @click="emit('pick', story.storycode)"
      >
        <div
          class="bar"
          :style="{ width: `${Math.max(4, story.confidence * 100)}%` }"
        />
        <StoryWithImage :storycode="story.storycode" />
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
const { t: $t } = useI18n();

defineProps<{
  stories: { storycode: string; confidence: number }[];
}>();

const emit = defineEmits<{
  (e: "pick", storycode: string): void;
}>();
</script>

<style scoped lang="scss">
.likely {
  flex: 0 0 18rem;
  align-self: flex-start;
}

.heading {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9aa1ac;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 16rem;
  overflow-y: auto;
}

.entry {
  position: relative;
  height: 4rem;
  overflow: hidden;
  padding: 0.25rem;
  margin-bottom: 0.25rem;
  background: #eee;
  color: #333;
  border-radius: 0.25rem;
  cursor: pointer;

  &:hover {
    background: #ddd;
  }
}

.bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: rgb(98 168 245 / 25%);
  pointer-events: none;
}
</style>
