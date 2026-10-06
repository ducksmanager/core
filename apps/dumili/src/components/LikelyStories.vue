<template>
  <aside class="likely">
    <h6 class="heading">
      {{ title ?? $t("Actuellement les plus probables") }}
    </h6>
    <ul class="list">
      <li
        v-for="story in stories"
        :key="story.storycode"
        class="entry"
        :class="{ selected: story.storycode === selected }"
        role="button"
        tabindex="0"
        @click="emit('pick', story.storycode)"
        @keydown.enter.self="emit('pick', story.storycode)"
        @keydown.space.self.prevent="emit('pick', story.storycode)"
      >
        <div
          v-if="story.confidence !== undefined"
          class="bar"
          :style="{ width: `${Math.max(4, story.confidence * 100)}%` }"
        />
        <StoryWithImage :storycode="story.storycode">
          <template v-if="story.sources?.length" #prefix>
            <div class="d-flex flex-wrap gap-1">
              <b-badge
                v-for="source in story.sources"
                :key="source"
                variant="secondary"
                >{{ source }}</b-badge
              >
            </div>
          </template>
        </StoryWithImage>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
const { t: $t } = useI18n();

defineProps<{
  title?: string;
  /** The accepted story, emphasised. */
  selected?: string;
  stories: {
    storycode: string;
    /** 0..1, drawn as a bar behind the row. */
    confidence?: number;
    /** Where the suggestion came from, shown as badges. */
    sources?: string[];
  }[];
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
  height: 10rem;
  overflow-x: auto;
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
}

.entry {
  position: relative;
  flex: 0 0 15rem;
  height: 100%;
  overflow: hidden;
  padding: 0.25rem;
  margin-bottom: 0.25rem;
  background: #eee;
  color: #333;
  border-radius: 0.25rem;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: #ddd;
  }
}

.selected {
  outline: 3px solid #62a8f5;
  outline-offset: -3px;
  font-weight: 700;
}

.bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: rgb(98 168 245 / 25%);
  pointer-events: none;
}
</style>
