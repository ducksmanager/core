<template>
  <b-row class="w-100 h-100">
    <b-col cols="6" class="d-flex flex-column justify-content-center text-wrap">
      <slot name="prefix" />
      <Story :storycode="storycode" />
    </b-col>
    <b-col
      cols="6"
      class="d-flex justify-content-center story-first-page"
      :style="{
        backgroundImage: `url(${inducksCoverRoot.replace('f_auto', 'c_crop,h_0.5,x_0,w_1') + storyUrls[storycode]})`,
      }"
      @mousemove="handleImageMouseMove"
      @mouseleave="handleImageLeave"
    >
    </b-col>
  </b-row>
</template>
<script setup lang="ts">
defineProps<{
  storycode: string;
}>();

defineSlots<{
  prefix?: () => VNode;
  default?: () => VNode;
}>();

const { storyUrls } = storeToRefs(coa());
const inducksCoverRoot = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/image/upload/f_auto/inducks-covers/`;

const handleImageMouseMove = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  const elementHeight = rect.height;

  // Calculate percentage from top (0 = top, 1 = bottom)
  const percentage = Math.max(0, Math.min(1, mouseY / elementHeight));

  // Convert percentage to background position (0% = top, 100% = bottom)
  const backgroundPosition = `center ${percentage * 100}%`;
  target.style.backgroundPosition = backgroundPosition;
};

const handleImageLeave = (event: Event) => {
  const target = event.target as HTMLElement;
  target.style.backgroundPosition = "top center";
};
</script>

<style scoped lang="scss">
.story-first-page {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: top center;
}
</style>
