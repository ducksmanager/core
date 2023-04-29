<template>
  <div>
    <div class="DashboardContainer" />
    <div v-if="withProgress" class="UppyDragDrop-Progress"></div>
  </div>
</template>

<script setup lang="ts">
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import XhrUpload from "@uppy/xhr-upload";
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
  }
);

const mainStore = main();
const { locale, t: $t } = useI18n();

const bytesUploaded = ref(0);

const uppyTranslations = {
  // "fr-FR": frTranslation,
  // "en-US": enTranslation,
};

const uppy = Uppy({
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
    .use(XhrUpload, {
      endpoint: "/fs/upload",
      getResponseError: (responseText: string) => {
        const { error, placeholders } = JSON.parse(responseText) as {
          error: string;
          placeholders: Record<string, string>;
        };
        return new Error($t(error, placeholders).toString());
      },
    });
  uppy.on("upload-progress", (data: { bytesUploaded: number }) => {
    bytesUploaded.value = data.bytesUploaded;
  });
  uppy.on("upload-success", (_, payload: { body: { fileName: string } }) => {
    if (props.photo && !props.multiple) {
      mainStore.photoUrls[props.edge!.issuenumber] = payload.body.fileName;
    } else {
      mainStore.loadItems({
        itemType: props.photo ? "photos" : "elements",
      });
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
