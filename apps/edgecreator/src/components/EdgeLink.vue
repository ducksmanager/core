<template>
  <span>
    <issue
      :publicationcode="publicationcode"
      :publicationname="publicationNames[publicationcode]"
      :issuenumber="issuenumber"
      hide-condition
    />
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
import { coa } from "~/stores/coa";

defineProps<{
  publicationcode: string;
  issuenumber: string;
  designers: any[];
  photographers: any[];
  published: boolean;
}>();

const publicationNames = computed(() => coa().publicationNames);
</script>
