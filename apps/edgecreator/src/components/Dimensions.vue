<template>
  <b-card class="mb-2" style="max-width: 16rem">
    <b-row v-for="dimension in ['width', 'height']" :key="dimension">
      <b-col cols="4">
        <label :for="dimension">{{ $t(ucFirst(dimension)) }}:</label>
      </b-col>
      <b-col cols="5">
        <b-form-input
          v-if="dimension === 'width'"
          :id="dimension"
          v-model.number="values.width"
          size="sm"
          autocomplete="off"
          type="number"
          :min="5"
          :max="50"
        />
        <b-form-input
          v-else
          :id="dimension"
          v-model.number="values.height"
          size="sm"
          autocomplete="off"
          type="number"
          :min="100"
          :max="350"
        />
      </b-col>
      <b-col cols="2" class="text-start">
        <label :for="dimension">mm</label>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
const values = defineModel<{
  width: number;
  height: number;
}>({
  default: { width: 15, height: 200 },
});

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);
</script>
