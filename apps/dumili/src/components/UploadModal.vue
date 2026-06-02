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
    <b-form-radio v-model="uploadFileType" name="file-type" value="PDF"
      >{{ $t("PDF") }}
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
      <template v-else-if="uploadFileType === 'PDF'"
        >{{
          $t(
            uploadExistingFileAction === "ignore"
              ? "Si votre PDF fait plus de {maxPages} page(s), les pages à partir de la page {firstOutOfRangePageNumber} seront ignorées."
              : "Si votre PDF fait plus de {maxPages} page(s), les pages à partir de la page {firstOutOfRangePageNumber} seront remplacées.",
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
    <div class="d-flex flex-column align-items-center">
      <div class="status">{{ processLog }}</div>
      <b-alert
        variant="info"
        :model-value="uploadFileType === 'PDF'"
        :dismissible="false"
        class="w-100"
        ><i18n-t
          keypath="Assurez-vous que le fichier PDF ait une taille de fichier de 50 MB au maximum. Si ce n'est pas le cas, vous pouvez utiliser un outil tel que {link} pour compresser votre fichier de telle sorte qu'il fasse moins de 50 MB."
        >
          <template #link
            ><a
              href="https://bigpdf.11zon.com/en/compress-pdf/compress-pdf-to-50mb"
              >11zon.com</a
            ></template
          >
        </i18n-t></b-alert
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
    </div>

    <div v-show="showWidget" id="widget-container" class="w-100"></div>
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

const showWidget = ref(true);

const uploadFileType = ref<"Images" | "PDF">("PDF");

const uploadExistingFileAction = ref<"ignore" | "replace">("ignore");

const isUploading = ref(false);
const processLog = ref("");

const emit = defineEmits<{
  (e: "upload-done"): void;
  (e: "done"): void;
}>();

const uppy = shallowRef<Uppy>();

watch(
  () => uploadPageNumber,
  (value) => {
    if (value !== undefined) {
      modal.value = true;
      showWidget.value = true;
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
  uploadFileType.value === "PDF"
    ? [".pdf"]
    : [".png", ".jpeg", ".jpg", "image/png", "image/jpeg"];

const initUppy = () => {
  if (uppy.value) {
    uppy.value.destroy();
    uppy.value = undefined;
  }

  const maxFileSize =
    uploadFileType.value === "PDF" ? 20 * 1024 * 1024 : 5 * 1024 * 1024;

  const instance = new Uppy({
    restrictions: {
      allowedFileTypes: getFileTypes(),
      maxFileSize,
    },
  });

  instance.use(Dashboard, {
    hideProgressDetails: false,
    autoOpen: "imageEditor",
    inline: true,
    proudlyDisplayPoweredByUppy: false,
    target: "#widget-container",
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
    for (const [uploadedFileIndex, fileId] of fileIds.entries()) {
      const file = instance.getFile(fileId);
      if (!file?.data || !(file.data instanceof Blob)) {
        continue;
      }

      processLog.value = `Uploading ${file.name}...`;
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
        isUploading.value = false;
        processLog.value =
          typeof error === "object" && error !== null && "error" in error
            ? (error.error as string)
            : String(error);
        return;
      }
    }
  });

  instance.on("complete", () => {
    isUploading.value = false;
    modal.value = false;
    emit("upload-done");
  });

  instance.on("error", (error) => {
    isUploading.value = false;
    processLog.value = error.message;
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

#widget-container {
  min-height: 460px;
}

#widget-container :deep(.uppy-Dashboard-inner) {
  width: 100% !important;
}
</style>
