<template>
  <UppyContextProvider :uppy="uppy">
    <div class="upload-panel">
      <UppyHookDropzone :note="$t('Pictures up to 3 MB')" />

      <ul v-if="files.length" class="upload-files">
        <li v-for="file in files" :key="file.id" class="upload-file-row">
          <span class="upload-file-name">{{ file.name }}</span>
          <button
            type="button"
            class="upload-file-remove"
            @click="removeFile(file.id)"
          >
            {{ $t("Remove") }}
          </button>
        </li>
      </ul>

      <div
        v-if="withProgress"
        class="upload-progress"
        :class="{ 'is-active': isUploading, 'is-error': !!uploadError }"
      >
        <p class="upload-progress__label">
          {{
            uploadError ||
            (isUploading
              ? $t("Uploading")
              : uploadProgress === 100
                ? $t("Done")
                : $t("Ready to upload"))
          }}
        </p>
        <div class="upload-progress__bar">
          <div
            class="upload-progress__fill"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
      </div>
    </div>
  </UppyContextProvider>
</template>

<script setup lang="ts">
import Uppy, { type UppyFile } from "@uppy/core";
import { UppyContextProvider } from "@uppy/vue";
import { watch } from "vue";
import { useI18n } from "vue-i18n";

import { main } from "~/stores/main";
import UppyHookDropzone from "./UppyHookDropzone.vue";

const {
  withProgress = true,
  photo = false,
  multiple = false,
  edge = null,
} = defineProps<{
  withProgress?: boolean;
  photo?: boolean;
  multiple?: boolean;
  edge?: { issuenumber: string } | null;
}>();

const { upload: uploadServices } = inject(edgecreatorSocketInjectionKey)!;

const mainStore = main();
const { locale, t: $t } = useI18n();
type UploadMeta = Record<string, unknown>;
type UploadBody = Record<string, never>;

const files = ref<UppyFile<UploadMeta, UploadBody>[]>([]);
const isUploading = ref(false);
const uploadProgress = ref(0);
const uploadError = ref<string | null>(null);

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const uppy = new Uppy<UploadMeta, UploadBody>({
  autoProceed: true,
  debug: true,
  allowMultipleUploadBatches: false,
  meta: {
    photo: photo,
    multiple: multiple,
    edge: JSON.stringify(edge),
    locale: locale.value === "fr" ? "fr-FR" : "en-US",
  },
  restrictions: {
    maxFileSize: 3 * 1024 * 1024,
    minNumberOfFiles: 1,
    maxNumberOfFiles: photo ? 1 : 10,
    allowedFileTypes: photo ? ["image/jpg", "image/jpeg"] : ["image/png"],
  },
});

const syncFiles = () => {
  files.value = uppy.getFiles();
};

const onFileAdded = async (file: UppyFile<UploadMeta, UploadBody>) => {
  syncFiles();
  uploadError.value = null;
  isUploading.value = true;

  if (!(file.data instanceof Blob)) {
    uploadError.value = $t("Unsupported file data").toString();
    isUploading.value = false;
    uploadProgress.value = 0;
    return;
  }

  const fileArrayBuffer = await file.data.arrayBuffer();

  try {
    const uploadParams = photo
      ? {
          issuecode: mainStore.issuecodes[0],
          data: arrayBufferToBase64(fileArrayBuffer),
          isEdgePhoto: true as const,
        }
      : {
          issuecode: mainStore.issuecodes[0],
          data: arrayBufferToBase64(fileArrayBuffer),
          isEdgePhoto: false as const,
          fileName: file.name,
        };

    const results = await uploadServices.uploadFromBase64(uploadParams);

    if ("error" in results) {
      const details = String(results.errorDetails ?? $t("Upload failed"));
      uploadError.value = details;
      uploadProgress.value = 0;
      window.alert(details);
    } else {
      if (photo && !multiple) {
        mainStore.photoUrls[edge!.issuenumber] = (
          results as { fileName: string }
        ).fileName;
      }

      mainStore.loadItems({
        itemType: photo ? "photos" : "elements",
      });
      uploadProgress.value = 100;
    }
  } catch (error) {
    const errorText =
      typeof error === "object" && error && "error" in error
        ? String(error.error)
        : String(error);

    uploadError.value = errorText;
    uploadProgress.value = 0;
    window.alert(errorText);
  } finally {
    isUploading.value = false;
    syncFiles();
  }
};

const onFileRemoved = () => {
  syncFiles();
};

const removeFile = (fileId: string) => {
  uppy.removeFile(fileId);
};

watch(locale, (newLocale) => {
  uppy.setMeta({
    locale: newLocale === "fr" ? "fr-FR" : "en-US",
  });
});

onMounted(() => {
  uppy.on("file-added", onFileAdded);
  uppy.on("file-removed", onFileRemoved);
  syncFiles();
});

onUnmounted(() => {
  uppy.off("file-added", onFileAdded);
  uppy.off("file-removed", onFileRemoved);
  uppy.destroy();
});
</script>

<style lang="scss">
.upload-panel {
  display: grid;
  gap: 12px;
}

.upload-files {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.upload-file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background: #fff;
}

.upload-file-name {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-file-remove {
  border: 0;
  background: transparent;
  color: #b33a3a;
  font-weight: 600;
}

.upload-progress {
  display: grid;
  gap: 8px;
}

.upload-progress__label {
  margin: 0;
  font-size: 0.9rem;
  color: #4d4d4d;
}

.upload-progress__bar {
  height: 10px;
  border-radius: 999px;
  background: #e9ecef;
  overflow: hidden;
}

.upload-progress__fill {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, #1f7a8c 0%, #1b9aaa 100%);
  transition: width 0.2s ease;
}

.upload-progress.is-active .upload-progress__fill {
  animation: upload-progress-pulse 1.2s linear infinite;
}

.upload-progress.is-error .upload-progress__fill {
  background: #c83e4d;
}

@keyframes upload-progress-pulse {
  0% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.08);
  }

  100% {
    filter: brightness(1);
  }
}
</style>
