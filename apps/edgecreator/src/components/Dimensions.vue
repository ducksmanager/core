<template>
  <b-card class="mb-2" style="max-width: 16rem">
    <b-row v-for="dimension in ['width', 'height']" :key="dimension">
      <b-col cols="4">
        <label :for="dimension">{{ $t(ucFirst(dimension)) }}:</label>
      </b-col>
      <b-col cols="5">
        <b-form-input
          :id="dimension"
          v-model="values[dimension as 'width'|'height']"
          size="sm"
          autocomplete="off"
          type="number"
          :min="dimension === 'width' ? 5 : 100"
          :max="dimension === 'width' ? 50 : 350"
          @input="
            $emit(
              'change',
              dimension === 'width'
                ? { width: parseInt($event), height }
                : { width, height: parseInt($event) }
            )
          "
        />
      </b-col>
      <b-col cols="2" class="text-start">
        <label :for="dimension">mm</label>
      </b-col>
    </b-row>
  </b-card>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
  }>(),
  {
    width: 15,
    height: 200,
  }
);

const values = ref(props);

const emit = defineEmits<{
  (e: "change", value: { width: number; height: number }): void;
}>();

emit("change", {
  width: props.width,
  height: props.height,
});

const ucFirst = (text: string) =>
  text[0].toUpperCase() + text.substring(1, text.length);
</script>
