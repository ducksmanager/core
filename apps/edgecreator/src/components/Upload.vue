<template>
  <div>
    <div class="DashboardContainer" />
    <div v-if="withProgress" class="UppyDragDrop-Progress" />
  </div>
</template>

<script setup lang="ts">
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import { useI18n } from "vue-i18n";

// import frTranslation from "@uppy/locales/lib/fr_FR";
// import enTranslation from "@uppy/locales/lib/en_US";
import { main } from "~/stores/main";

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

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// const uppyTranslations = {
// "fr-FR": frTranslation,
// "en-US": enTranslation,
// };

const uppy = Uppy({
  autoProceed: true,
  debug: true,
  // locale: uppyTranslations[i18n.locale.value],
  allowMultipleUploads: false,
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

onMounted(() => {
  uppy
    .use(Dashboard, {
      inline: true,
      target: ".DashboardContainer",
      replaceTargetContent: true,
      note: $t("Pictures up to 3 MB"),
      height: 470,
      browserBackButtonClose: true,
      proudlyDisplayPoweredByUppy: false,
    })
    .on("file-added", async (file) => {
      const fileArrayBuffer = await file.data.arrayBuffer();
      try {
        const results = await uploadServices.uploadFromBase64({
          issuecode: mainStore.issuecodes[0],
          data: arrayBufferToBase64(fileArrayBuffer),
          isEdgePhoto: false,
          fileName: file.name,
        });
        if ("error" in results) {
          window.alert(results.errorDetails);
        } else {
          if (photo && !multiple) {
            mainStore.photoUrls[edge!.issuenumber] = (
              results as { fileName: string }
            ).fileName;
          }

          mainStore.loadItems({
            itemType: photo ? "photos" : "elements",
          });
        }
      } catch (error) {
        window.alert((error as { error: string }).error);
      }
    });
});
</script>

<style src="@uppy/core/dist/style.css"></style>
<style src="@uppy/dashboard/dist/style.css"></style>
<style lang="scss">
.uppy-Dashboard-inner {
  width: 100vw !important;
  height: 100vh !important;

  .uppy-Dashboard-Item-previewImg {
    object-fit: contain !important;
  }
}

:deep(a.uppy-Dashboard-poweredBy) {
  display: none;
}
</style>
