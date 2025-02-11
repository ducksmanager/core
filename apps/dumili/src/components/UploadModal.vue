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
    <b-form-radio
      disabled
      :model-value="['PDF_ignore', 'PDF_replace'].includes(uploadFileType)"
      >{{ $t("PDF") }}
    </b-form-radio>
    <b-form-radio
      v-model="uploadFileType"
      class="ms-2"
      name="file-type"
      value="PDF_ignore"
      >{{ $t("Ignorer les pages existantes") }}
    </b-form-radio>
    <b-form-radio
      v-model="uploadFileType"
      class="ms-2"
      name="file-type"
      value="PDF_replace"
      >{{ $t("Remplacer les pages existantes") }}
    </b-form-radio>
    <b-form-radio v-model="uploadFileType" name="file-type" value="Images"
      >{{ $t("Images") }}
    </b-form-radio>
    <div class="status">{{ processLog }}</div>
    <div class="d-flex flex-column align-items-center">
      <b-alert
        :variant="uploadFileType === 'PDF_ignore' ? 'info' : 'warning'"
        :model-value="['PDF_ignore', 'PDF_replace'].includes(uploadFileType)"
        :dismissible="false"
        class="w-100 mt-3"
        >{{
          $t(
            uploadFileType === "PDF_ignore"
              ? "Les images envoyées seront associées aux pages {firstPage} à {lastPage}. Si votre PDF fait plus de {maxPages} page(s), les pages suivantes seront ignorées."
              : "Les images envoyées seront associées aux pages {firstPage} à {lastPage}. Si votre PDF fait plus de {maxPages} page(s), les pages suivantes seront remplacées.",
            {
              firstPage: pagesWithoutOverwrite[0].pageNumber,
              lastPage: pages[pages.length - 1].pageNumber,
              maxPages: pagesWithoutOverwrite.length,
            },
          )
        }}
      </b-alert>
      <b-alert
        variant="info"
        :model-value="['PDF_ignore', 'PDF_replace'].includes(uploadFileType)"
        :dismissible="false"
        class="w-100"
        ><i18n-t
          keypath="Assurez-vous que le fichier PDF ait une taille de fichier de 10 MB au maximum. Si ce n'est pas le cas, vous pouvez utiliser un outil tel que {link} pour compresser votre fichier de telle sorte qu'il fasse moins de 10 MB."
        >
          <template #link
            ><a
              href="https://bigpdf.11zon.com/en/compress-pdf/compress-pdf-to-10mb"
              >11zon.com</a
            ></template
          >
        </i18n-t></b-alert
      >
    </div>
    <div v-show="showWidget" id="widget-container" class="w-100"></div>
  </b-modal>
</template>

<script setup lang="ts">
import type {
  CloudinaryCreateUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "cloudinary-widget";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";

import { stores as webStores } from "~web";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const {
  pagesWithoutOverwrite: pagesWithoutOverwriteInitial,
  pagesAllowOverwrite: pagesAllowOverwriteInitial,
  uploadPageNumber,
} = defineProps<{
  uploadPageNumber?: number;
  pagesWithoutOverwrite: { id: number; pageNumber: number }[];
  pagesAllowOverwrite: { id: number; pageNumber: number }[];
}>();

const modal = ref(false);

const pagesWithoutOverwrite = ref(pagesWithoutOverwriteInitial);
const pagesAllowOverwrite = ref(pagesAllowOverwriteInitial);

watch(
  () => modal,
  (value) => {
    if (value) {
      pagesWithoutOverwrite.value = pagesWithoutOverwriteInitial;
      pagesAllowOverwrite.value = pagesAllowOverwriteInitial;
    }
  },
);

const { t: $t } = useI18n();

const { indexation } = storeToRefs(suggestions());

const { user } = storeToRefs(webStores.collection());

const showWidget = ref(true);

const uploadFileType = ref<"PDF_ignore" | "PDF_replace" | "Images">(
  "PDF_ignore",
);

const isUploading = ref(false);
const processLog = ref("");

const emit = defineEmits<{
  (e: "done"): void;
  (e: "abort"): void;
}>();

declare var cloudinary: {
  createUploadWidget: CloudinaryCreateUploadWidget;
};

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
  uploadFileType.value === "PDF_ignore"
    ? pagesWithoutOverwrite.value
    : pagesAllowOverwrite.value,
);

const processPage = async (pageIndex: number, url: string) => {
  const page = pages.value[pageIndex];
  processLog.value = `Processing page ${page.pageNumber}...`;
  await indexationSocket.value!.setPageUrl(page.id, url);
};

onMounted(() => {
  const fileIds: string[] = [];
  const folderName = indexation.value!.id;
  const uploadWidget = cloudinary.createUploadWidget(
    {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME,
      uploadPreset: "p1urov1k",
      folder: `dumili/${user.value!.username}/${folderName}`,
      showPoweredBy: false,
      sources: ["local", "url", "camera"],
      maxFileSize: 10 * 1024 * 1024,
      maxImageFileSize: 5 * 1024 * 1024,
      inlineContainer: "#widget-container",
      context: {
        indexation: folderName,
        project: "dumili",
        user: user.value!.username,
      },
    },
    async (error, result) => {
      if (error) {
        console.error(error);
      } else {
        switch (result?.event) {
          case "upload-added":
            fileIds.push((result.info as CloudinaryUploadWidgetInfo).id);
            break;
          case "queues-start":
            isUploading.value = true;
            break;
          case "success":
            showWidget.value = false;
            const info = result.info as CloudinaryUploadWidgetInfo;
            console.log("Done! Here is the image info: ", info);

            const firstUploadPageIndex = pages.value.findIndex(
              (page) => page.pageNumber === uploadPageNumber,
            );
            if (info.pages) {
              for (
                let page = 1;
                page <= Math.min(info.pages, pages.value.length);
                page++
              ) {
                await processPage(
                  firstUploadPageIndex + page - 1,
                  info.secure_url
                    .replace("/upload/", `/upload/pg_${page}/`)
                    .replace(/.pdf$/g, ".png"),
                );
              }
            } else {
              await processPage(
                firstUploadPageIndex + fileIds.indexOf(info.id),
                info.secure_url,
              );
            }
            modal.value = false;
            emit("done");
            break;
          case "abort":
            emit("abort");
            break;
        }
      }
    },
  );

  watch(showWidget, (value) => {
    if (!value) {
      uploadWidget?.close();
    }
  });
});
</script>

<style lang="scss">
iframe {
  visibility: visible !important;
  max-width: initial !important;
  max-height: initial !important;
}

.modal-dialog {
  height: calc(100% - 5rem) !important;
}
</style>
