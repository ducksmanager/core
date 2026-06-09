<template>
  <b-modal
    id="upload-modal"
    v-model="modal"
    :title="$t('Envoi d\'images de pages')"
    align="center"
    no-footer
    centered
    :class="{ 'pe-none': isUploading }"
    content-class="h-100 "
    dialog-class="h-100"
    body-class="d-flex flex-column align-items-start overflow-auto"
  >
    <label>{{ $t("Type de fichier") }}</label>
    <b-form-radio v-model="uploadFileType" name="file-type" value="Document"
      >{{ $t("Document (PDF, RAR, CBR, ZIP, CBZ)") }}
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
      v-if="isUploading || errorMessage"
      :max="100"
      class="w-100 text-white"
      style="min-height: 2rem"
      :class="{ 'bg-danger': errorMessage }"
    >
      <b-progress-bar :value="overallProgress">
        <div
          class="position-absolute d-flex w-100 align-items-center justify-content-center"
        >
          {{ progressLabel }}
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
import XHRUpload from "@uppy/xhr-upload";
import "@uppy/core/css/style.min.css";
import "@uppy/dashboard/css/style.min.css";
import "@uppy/image-editor/css/style.min.css";
import "@uppy/webcam/css/style.min.css";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

const { indexationSocket, options } = inject(dumiliSocketInjectionKey)!;

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

const route = useRoute();

const modal = ref(false);
const authToken = ref<string | null>(null);

const pagesWithoutOverwrite = ref(pagesWithoutOverwriteInitial);
const pagesAllowOverwrite = ref(pagesAllowOverwriteInitial);

watch(modal, async (value) => {
  if (value) {
    authToken.value = (await options.session.getToken()) ?? null;
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
const errorMessage = ref("");

const pagesToUpload = ref<number[]>();
const pagesUploaded = ref<number[]>([]);
const httpUploadProgress = ref(0);

const overallProgress = computed(() => {
  const httpPart = httpUploadProgress.value / 2;
  const cloudinaryPart = pagesToUpload.value?.length
    ? (pagesUploaded.value.length / pagesToUpload.value.length) * 50
    : 0;
  return httpPart + cloudinaryPart;
});

const progressLabel = computed(() => {
  if (errorMessage.value) return errorMessage.value;
  if (httpUploadProgress.value < 100) return $t("Envoi du fichier...");
  if (!pagesToUpload.value?.length) return "";
  return $t("Page {pagesUploaded}/{totalPages} envoyée", {
    pagesUploaded: pagesUploaded.value.length,
    totalPages: pagesToUpload.value.length,
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

const getFileTypes = () =>
  uploadFileType.value === "Document"
    ? [
        ".pdf",
        ".rar",
        ".cbr",
        ".zip",
        ".cbz",
        "application/x-rar",
        "application/pdf",
        "application/octet-stream",
        "application/zip",
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

  let fileAddCount = 0;
  instance.on("file-added", (file) => {
    const idx = fileAddCount++;
    instance.setFileMeta(file.id, {
      firstPageNumber: uploadPageNumber + idx,
    });
  });

  const indexationId = route.params.id as string;

  instance.use(XHRUpload, {
    endpoint: `${import.meta.env.VITE_DUMILI_SOCKET_URL}/upload/indexation/${indexationId}`,
    formData: false,
    method: "POST",
    limit: 1,
    headers: (file) => ({
      Authorization: `Bearer ${authToken.value ?? ""}`,
      "X-File-Name": encodeURIComponent(file.name ?? ""),
      "X-First-Page-Number": String(
        (file.meta.firstPageNumber as number | undefined) ?? uploadPageNumber,
      ),
      "X-First-Out-Of-Range-Page-Number": String(
        firstOutOfRangePageNumber.value,
      ),
    }),
  });

  instance.on("upload", () => {
    isUploading.value = true;
    httpUploadProgress.value = 0;
    pagesUploaded.value = [];
    pagesToUpload.value = undefined;
    errorMessage.value = "";
    if (uploadFileType.value === "Images") {
      const files = instance.getFiles();
      pagesToUpload.value = files.map((_, i) => uploadPageNumber + i);
    }
  });

  instance.on("progress", (percent) => {
    httpUploadProgress.value = percent;
  });

  instance.on("upload-error", (_file, _error, response) => {
    try {
      const responseObject = JSON.parse(
        (response as { response?: string })?.response || "{}",
      );
      errorMessage.value = responseObject?.error || _error.message || "";
    } catch {}
    instance.cancelAll();
    isUploading.value = false;
  });

  instance.on("complete", (result) => {
    if (result.failed?.length === 0 && !errorMessage.value) {
      modal.value = false;
      emit("upload-done");
    }
    isUploading.value = false;
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
