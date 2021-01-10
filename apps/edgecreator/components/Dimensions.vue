<template>
  <b-card class="mb-2" style="max-width: 16rem">
    <b-row v-for="dimension in ['width', 'height']" :key="dimension">
      <b-col cols="4">
        <label :for="dimension">{{ $t(ucFirst(dimension)) }}:</label>
      </b-col>
      <b-col cols="4">
        <b-form-input
          :id="dimension"
          :value="dimension === 'width' ? width : height"
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
        ></b-form-input>
      </b-col>
      <b-col cols="2" class="text-left">
        <label :for="dimension">mm</label>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  name: 'Dimensions',
  props: {
    width: { type: Number, default: 15 },
    height: { type: Number, default: 200 },
  },

  mounted() {
    this.$emit('change', {
      width: this.width,
      height: this.height,
    })
  },

  methods: {
    ucFirst: (text) => text[0].toUpperCase() + text.substring(1, text.length),
  },
}
</script>

<style scoped></style>
