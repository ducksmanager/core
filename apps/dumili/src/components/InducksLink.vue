<template>
  <a
    :href="`https://inducks.org/story.php?c=${urlEncodedStorycode}`"
    target="_blank"
    @click.stop="$event.stopPropagation()"
    ><img
      src="/coafoot.png"
      :style="{ width: '1.5em' }"
      :title="$t('Voir sur Inducks')"
      alt="Inducks"
  /></a>
</template>
<script setup lang="ts">
defineProps<{
  urlEncodedStorycode: string;
}>();
</script>