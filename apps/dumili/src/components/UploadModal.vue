<template>
  <b-modal
    id="upload-modal"
    v-model="modal"
    :title="$t('Envoi d\'images de pages')"
    align="center"
    no-footer
    centered
    :class="{ 'pe-none': isUploading || processLog }"
    content-class="h-100 "
    dialog-class="h-100"
    body-class="d-flex flex-column align-items-start overflow-auto"
  >
    <label>{{ $t("Type de fichier") }}</label>
    <b-form-radio v-model="uploadFileType" name="file-type" value="Document"
      >{{ $t("Document (PDF, RAR, CBR)") }}
    </b-form-radio>
    <b-form-radio v-model="uploadFileType" name="file-type" value="Images"
      >{{ $t("Images") }}
    </b-form-radio>

    <template
      v-if="
        pagesWithoutOverwrite.length !== pages.length &&
        firstOutOfRangePageNumber <=
          pagesWithoutOverwrite[0].pageNumber + pagesWithoutOverwrite.length
      "
    >
      <label class="mt-3">{{
        $t("Comportement pour les pages existantes")
      }}</label>
      <b-form-radio
        v-model="uploadExistingFileAction"
        name="existing-file-behavior"
        value="ignore"
        >{{ $t("Ignorer les pages existantes") }}
      </b-form-radio>
      <b-form-radio
        v-model="uploadExistingFileAction"
        name="existing-file-behavior"
        value="replace"
        >{{ $t("Remplacer les pages existantes") }}
      </b-form-radio>
    </template>
    <b-alert
      :variant="uploadExistingFileAction === 'ignore' ? 'info' : 'warning'"
      :model-value="pagesWithoutOverwrite.length !== pages.length"
      :dismissible="false"
      class="w-100 mt-3"
      >{{
        $t(
          "Les images envoyées seront associées aux pages à partir de la page {firstPage}.",
          { firstPage: pagesWithoutOverwrite[0].pageNumber },
        )
      }}
      <template v-if="pagesWithoutOverwrite.length === pages.length" />
      <template v-else-if="uploadFileType === 'Document'"
        >{{
          $t(
            uploadExistingFileAction === "ignore"
              ? "Si votre document fait plus de {maxPages} page(s), les pages à partir de la page {firstOutOfRangePageNumber} seront ignorées."
              : "Si votre document fait plus de {maxPages} page(s), les pages à partir de la page {firstOutOfRangePageNumber} seront remplacées.",
            {
              maxPages: pagesWithoutOverwrite.length,
              firstOutOfRangePageNumber,
            },
          )
        }}
      </template>
      <template v-else
        >{{
          $t(
            uploadExistingFileAction === "ignore"
              ? "Si vous envoyez plus de {maxPages} fichier(s), les pages à partir de la page {firstOutOfRangePageNumber} seront ignorées."
              : "Si vous envoyez plus de {maxPages} fichier(s), les pages à partir de la page {firstOutOfRangePageNumber} seront remplacées.",
            {
              maxPages: pagesWithoutOverwrite.length,
              firstOutOfRangePageNumber,
            },
          )
        }}
      </template>
    </b-alert>
    <b-alert
      variant="info"
      :model-value="uploadFileType === 'Document'"
      :dismissible="false"
      class="w-100"
      >{{
        $t(
          "Assurez-vous que le document ait une taille de fichier de 50 MB au maximum.",
        )
      }}</b-alert
    >
    <b-alert
      variant="info"
      :model-value="uploadFileType === 'Images'"
      :dismissible="false"
      class="w-100"
      >{{
        $t(
          "Vous aurez la possibilité de rogner les images avant de les envoyer.",
        )
      }}
    </b-alert>

    <b-progress
      v-if="processLog"
      :max="pagesToUpload?.length || 1"
      class="w-100 text-white"
      style="min-height: 2rem"
      :class="{ 'bg-primary': pagesToUpload, 'bg-danger': !pagesToUpload }"
    >
      <b-progress-bar :value="pagesUploaded.length">
        <div
          class="position-absolute d-flex w-100 align-items-center justify-content-center"
        >
          {{ processLog }}
        </div>
      </b-progress-bar>
    </b-progress>
    <div id="uppy-container" class="w-100"></div>
  </b-modal>
</template>

<script setup lang="ts">
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import ImageEditor from "@uppy/image-editor";
import Webcam from "@uppy/webcam";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "@uppy/image-editor/css/style.min.css";
import "@uppy/webcam/css/style.min.css";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const {
  pagesWithoutOverwrite: pagesWithoutOverwriteInitial,
  pagesAllowOverwrite: pagesAllowOverwriteInitial,
  uploadPageNumber,
} = defineProps<{
  uploadPageNumber: number;
  pagesWithoutOverwrite: { id: number; pageNumber: number }[];
  pagesAllowOverwrite: { id: number; pageNumber: number }[];
}>();

const emit = defineEmits<{
  (e: "upload-done"): void;
  (e: "done"): void;
}>();

const modal = ref(false);

const pagesWithoutOverwrite = ref(pagesWithoutOverwriteInitial);
const pagesAllowOverwrite = ref(pagesAllowOverwriteInitial);

watch(modal, (value) => {
  if (value) {
    pagesWithoutOverwrite.value = pagesWithoutOverwriteInitial;
    pagesAllowOverwrite.value = pagesAllowOverwriteInitial;
  } else {
    emit("done");
  }
});

const { t: $t } = useI18n();

const uploadFileType = ref<"Images" | "Document">("Document");

const uploadExistingFileAction = ref<"ignore" | "replace">("ignore");

const isUploading = ref(false);
const processLog = ref("");

const pagesToUpload = ref<number[]>();
const pagesUploaded = ref<number[]>([]);

watch(
  pagesToUpload,
  (value) => {
    if (value) {
      pagesUploaded.value = [];
      processLog.value = $t("Envoi de {pagesToUpload} page(s)...", {
        pagesToUpload: value,
      });
    } else {
      processLog.value = "";
    }
  },
  { immediate: true },
);

watch(pagesUploaded, (value) => {
  processLog.value = $t("Page {pagesUploaded}/{totalPages} envoyée", {
    pagesUploaded: value.length,
    totalPages: pagesToUpload.value!.length,
  });
});

indexationSocket.value!.reportDocumentAnalyzed = (
  reportedPagesToUpload: number[],
) => {
  pagesToUpload.value = reportedPagesToUpload;
};

indexationSocket.value!.reportDocumentPageUploaded = (pageNumber: number) => {
  pagesUploaded.value = [...pagesUploaded.value, pageNumber];
};

const uppy = shallowRef<Uppy>();

watch(
  () => uploadPageNumber,
  (value) => {
    if (value !== undefined) {
      modal.value = true;
    }
  },
  { immediate: true },
);

const pages = computed(() =>
  uploadExistingFileAction.value === "replace"
    ? pagesWithoutOverwrite.value
    : pagesAllowOverwrite.value,
);

const firstOutOfRangePageNumber = computed(
  () =>
    pagesWithoutOverwrite.value[pagesWithoutOverwrite.value.length - 1]
      .pageNumber + 1,
);

const fileToBase64 = async (file: Blob) => {
  const arrayBuffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  for (let idx = 0; idx < bytes.length; idx++) {
    binary += String.fromCharCode(bytes[idx]);
  }
  return btoa(binary);
};

const getFileTypes = () =>
  uploadFileType.value === "Document"
    ? [
        ".pdf",
        ".rar",
        ".cbr",
        "application/x-rar",
        "application/pdf",
        "application/octet-stream",
      ]
    : [".png", ".jpeg", ".jpg", "image/png", "image/jpeg"];

const initUppy = () => {
  if (uppy.value) {
    uppy.value.destroy();
    uppy.value = undefined;
  }

  const maxFileSize =
    uploadFileType.value === "Document" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

  const instance = new Uppy({
    restrictions: {
      allowedFileTypes: getFileTypes(),
      maxFileSize,
      maxNumberOfFiles: uploadFileType.value === "Document" ? 1 : 50,
    },
  });

  instance.use(Dashboard, {
    hideProgressDetails: false,
    autoOpen: "imageEditor",
    inline: true,
    proudlyDisplayPoweredByUppy: false,
    target: "#uppy-container",
  });

  if (uploadFileType.value === "Images") {
    instance.use(Webcam, {
      modes: ["picture"],
      mirror: false,
    });
    instance.use(ImageEditor);
  }

  instance.addUploader(async (fileIds) => {
    isUploading.value = true;
    processLog.value = "";
    let isError = false;
    for (const [uploadedFileIndex, fileId] of fileIds.entries()) {
      const file = instance.getFile(fileId);
      if (!file?.data || !(file.data instanceof Blob)) {
        continue;
      }

      try {
        const result = await indexationSocket.value!.uploadFileToCloudinary({
          dataBase64: await fileToBase64(file.data),
          mimeType: file.type,
          fileName: file.name,
          firstPageNumber: uploadPageNumber + uploadedFileIndex,
          firstOutOfRangePageNumber: firstOutOfRangePageNumber.value,
        });

        if ("error" in result) {
          throw new Error(result.error);
        }
      } catch (error) {
        isError = true;
        processLog.value =
          typeof error === "object" && error !== null && "error" in error
            ? (error.error as string)
            : String(error);
      }
    }

    isUploading.value = false;
    if (isError) {
      instance.cancelAll();
    } else {
      modal.value = false;
      emit("upload-done");
    }
  });

  uppy.value = instance;
};

onMounted(() => {
  watch(uploadFileType, initUppy, { immediate: true });
});

onBeforeUnmount(() => {
  uppy.value?.destroy();
});
</script>

<style lang="scss">
.modal-dialog {
  height: calc(100% - 5rem) !important;
}

.uppy-Dashboard-inner {
  width: 100% !important;
}
</style>
