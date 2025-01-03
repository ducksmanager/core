<template>
  <span>
    <issue :issuecode="issuecode" hide-condition no-wrap />
    <div>
      <b-badge v-if="published">modification</b-badge>
      <b-badge v-for="designer in designers" :key="`designer-${designer}`"
        >{{ $t("Designer") }}:{{ designer }}</b-badge
      >
      <b-badge
        v-for="photographer in photographers"
        :key="`photographer-${photographer}`"
        >{{ $t("Photographer") }}:{{ photographer }}</b-badge
      >
    </div>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  issuecode: string;
  designers: string[];
  photographers: string[];
  published: boolean;
}>();
</script>
