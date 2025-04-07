<template>
  <div class="w-100">
    <slot name="before" />
    <div
      class="d-flex flex-row justify-space-around align-items-center edit-wrapper"
    >
      <template v-if="isMultipleAndNotEditing">
        {{ $t("Multiple values.") }}
        <b-button
          size="sm"
          pill
          @click="
            edit = true;
            emit('setToFirstValue');
          "
        >
          {{ $t("Edit") }}
        </b-button>
      </template>
      <slot v-else />
    </div>
  </div>
</template>
<script setup lang="ts">
const emit = defineEmits<(e: "setToFirstValue") => void>();

const { isMultiple } = defineProps<{
  isMultiple: boolean;
}>();

const edit = ref(false);
const isMultipleAndNotEditing = computed(() => isMultiple && !edit.value);
</script>
