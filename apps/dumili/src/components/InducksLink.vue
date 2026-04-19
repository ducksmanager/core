<template>
  <a
    class="inducks-link"
    :href="`https://inducks.org/story.php?c=${urlEncodedStorycode}`"
    target="_blank"
    @click.stop="$event.stopPropagation()"
    ><img
      src="/coafoot.png"
      :style="{ width: '1.5em' }"
      :title="$t('Voir sur Inducks')"
      alt="Inducks"
    />
    <template v-if="showCode"> &nbsp;{{ storycode }} </template>
  </a>
</template>
<script setup lang="ts">
const { showCode = false, storycode } = defineProps<{
  storycode: string;
  showCode?: boolean;
}>();

const urlEncodedStorycode = computed(() => encodeURIComponent(storycode));
</script>