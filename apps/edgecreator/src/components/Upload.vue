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

const props = withDefaults(
  defineProps<{
    withProgress?: boolean;
    photo: boolean;
    multiple?: boolean;
    edge: { issuenumber: string } | null;
  }>(),
  {
    withProgress: true,
    photo: false,
    multiple: false,
    edge: null,
  },
);

const { upload: { services: uploadServices } } = inject(edgecreatorSocketInjectionKey)!;

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
    photo: props.photo,
    multiple: props.multiple,
    edge: JSON.stringify(props.edge),
    locale: locale.value === "fr" ? "fr-FR" : "en-US",
  },
  restrictions: {
    maxFileSize: 3 * 1024 * 1024,
    minNumberOfFiles: 1,
    maxNumberOfFiles: props.photo ? 1 : 10,
    allowedFileTypes: props.photo ? ["image/jpg", "image/jpeg"] : ["image/png"],
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
      const results = await uploadServices.uploadFromBase64({
        issuecode: mainStore.issuecodes[0],
        data: arrayBufferToBase64(fileArrayBuffer)

      });
      if ('error' in results) {
        window.alert(results.errorDetails);
        return;
      }
      else {
        if (props.photo && !props.multiple) {
          mainStore.photoUrls[props.edge!.issuenumber] = results.fileName;
        } else {
          mainStore.loadItems({
            itemType: props.photo ? "photos" : "elements",
          });
        }
      }
    })
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
