<template>
  <input v-bind="getInputProps()" class="visually-hidden" />
  <div v-bind="getRootProps()" role="button" class="uppy-dropzone">
    <div class="uppy-dropzone__content">
      <input v-bind="getFileInputProps()" class="visually-hidden" />
      <button v-bind="getButtonProps()" class="uppy-dropzone__button">
        {{ $t("Select files") }}
      </button>
      <p class="uppy-dropzone__hint">
        {{ $t("Drop files here or click to add them") }}
      </p>
    </div>
    <p v-if="note" class="uppy-dropzone__note">{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
import { useDropzone, useFileInput } from "@uppy/vue";
import { useI18n } from "vue-i18n";

const { note } = defineProps<{
  note: string;
}>();

const { getRootProps, getInputProps } = useDropzone({
  noClick: true,
});
const { getButtonProps, getInputProps: getFileInputProps } = useFileInput();

const { t: $t } = useI18n();
</script>

<style scoped lang="scss">
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.uppy-dropzone {
  border: 2px dashed #b8b8b8;
  border-radius: 12px;
  background: linear-gradient(180deg, #fdfdfd 0%, #f6f6f6 100%);
  padding: 18px;
  cursor: pointer;
}

.uppy-dropzone__content {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.uppy-dropzone__button {
  border: 1px solid #243447;
  border-radius: 999px;
  background: #243447;
  color: #fff;
  font-weight: 600;
  padding: 8px 14px;
  transition: background 0.2s ease;
}

.uppy-dropzone__button:hover {
  background: #1b2838;
}

.uppy-dropzone__hint {
  margin: 0;
  color: #4a4a4a;
  text-align: center;
}

.uppy-dropzone__note {
  margin: 10px 0 0;
  font-size: 0.85rem;
  color: #666;
}
</style>
