<template>
  <aside class="likely">
    <h6 class="heading">
      {{ title }}
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
defineProps<{
  title: string;
  selected?: string;
  stories: {
    storycode: string;
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
</style>
