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
        firstOutOfRangePage <=
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
              ? "Si votre PDF fait plus de {maxPages} page(s), les pages à partir de la page {firstOutOfRangePage} seront ignorées."
              : "Si votre PDF fait plus de {maxPages} page(s), les pages à partir de la page {firstOutOfRangePage} seront remplacées.",
            {
              maxPages: pagesWithoutOverwrite.length,
              firstOutOfRangePage,
            },
          )
        }}
      </template>
      <template v-else
        >{{
          $t(
            uploadExistingFileAction === "ignore"
              ? "Si vous envoyez plus de {maxPages} fichier(s), les pages à partir de la page {firstOutOfRangePage} seront ignorées."
              : "Si vous envoyez plus de {maxPages} fichier(s), les pages à partir de la page {firstOutOfRangePage} seront remplacées.",
            {
              maxPages: pagesWithoutOverwrite.length,
              firstOutOfRangePage,
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
      <b-alert
        variant="warning"
        :model-value="uploadFileType === 'Images'"
        :dismissible="false"
        class="w-100"
        >{{
          $t(
            "Lors de l'envoi de vos images, il est possible qu'un message avec le texte 'There are running uploads. Click OK to abort.' apparaisse. Si cela se produit, cliquez sur le bouton 'Cancel'.",
          )
        }}
      </b-alert>
    </div>
    <div v-show="showWidget" id="widget-container" class="w-100"></div>
  </b-modal>
</template>

<script setup lang="ts">
import type {
  CloudinaryCreateUploadWidget,
  CloudinaryUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "cloudinary-widget";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";
import { suggestions } from "~/stores/suggestions";

import { stores as webStores } from "~web";

const { indexationSocket } = inject(dumiliSocketInjectionKey)!;

const {
  pagesWithoutOverwrite: pagesWithoutOverwriteInitial,
  pagesAllowOverwrite: pagesAllowOverwriteInitial,
  uploadPageNumber = undefined,
} = defineProps<{
  uploadPageNumber?: number;
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

const { indexation } = storeToRefs(suggestions());

const { user } = storeToRefs(webStores.collection());

const showWidget = ref(true);

const uploadFileType = ref<"Images" | "PDF">("PDF");

const uploadExistingFileAction = ref<"ignore" | "replace">("ignore");

const isUploading = ref(false);
const processLog = ref("");

const emit = defineEmits<{
  (e: "upload-done"): void;
  (e: "done"): void;
}>();

declare var cloudinary: {
  openUploadWidget: CloudinaryCreateUploadWidget;
};

const uploadWidget = ref<CloudinaryUploadWidget>();

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

const firstOutOfRangePage = computed(
  () =>
    pagesWithoutOverwrite.value[pagesWithoutOverwrite.value.length - 1]
      .pageNumber + 1,
);

const processPage = async (pageIndex: number, url: string) => {
  const page = pages.value[pageIndex];
  console.log(`Processing page ${page.pageNumber}...`);
  processLog.value = `Processing page ${page.pageNumber}...`;
  await indexationSocket.value!.setPageUrl(page.id, url);
};

onMounted(() => {
  watch(
    uploadFileType,
    (value) => {
      const fileIds: string[] = [];
      const folderName = indexation.value!.id;
      if (uploadWidget.value) {
        uploadWidget.value.close();
        document.getElementById("widget-container")!.innerHTML = "";
      }
      uploadWidget.value = cloudinary.openUploadWidget(
        {
          cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME,
          uploadPreset: "dumili",
          folder: `dumili/${user.value!.username}/${folderName}`,
          showPoweredBy: false,
          sources:
            value === "PDF" ? ["local", "url"] : ["local", "url", "camera"],
          maxFileSize: 10 * 1024 * 1024,
          maxImageFileSize: 5 * 1024 * 1024,
          inlineContainer: "#widget-container",
          cropping: value === "Images",
          context: {
            indexation: folderName,
            user: user.value!.username,
          },
        },
        async (error, result) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Event: ", result.event);
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
                emit("upload-done");
                break;
              case "abort":
                modal.value = false;
                break;
            }
          }
        },
      );

      watch(showWidget, (value) => {
        if (!value) {
          uploadWidget.value?.close();
        }
      });
    },
    { immediate: true },
  );
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
