<template>
  <div class="DashboardContainer" />
  <div class="UppyDragDrop-Progress"></div>
</template>

<script setup lang="ts">
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import XHR from "@uppy/xhr-upload";
import Cookies from "js-cookie";
//

// import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";

// const {
//   coverId: { socket: coverIdSocket },
// } = inject(dmSocketInjectionKey)!;

const props = defineProps<{
  folderName: string;
}>();

const uppy = ref();

// const emit = defineEmits<{
//   (e: "done"): void;
//   (e: "abort"): void;
// }>();

// eslint-disable-next-line
declare var cloudinary: any;
// const uploadWidget = cloudinary.createUploadWidget(
//   {
//     cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME,
//     uploadPreset: "p1urov1k",
//     folder: fullFolderName.value,
//     cropping: true,
//     sources: ["local", "url"],
//     multiple: true,
//     maxImageFileSize: 5000000,
//     context: {
//       indexation: props.folderName,
//       project: "dumili",
//       user: webUser.value?.username,
//     },
//   },
//   (error: string, result: { event: string; info: unknown }) => {
//     if (error) {
//       console.error(error);
//     } else {
//       switch (result?.event) {
//         case "success":
//           console.log("Done! Here is the image info: ", result.info);
//           emit("done");
//           break;
//         case "abort":
//           emit("abort");
//           break;
//       }
//     }
//   }
// );

// uploadWidget.open();

onMounted(async () => {
  uppy.value = new Uppy({
    restrictions: {
      allowedFileTypes: [".jpg", ".jpeg", ".png", ".pdf"],
    },
  })
    .use(Dashboard, {
      inline: true,
      target: ".DashboardContainer",
      replaceTargetContent: true,
      // note: this.$t("Pictures up to 3 MB"),
      height: 470,
      browserBackButtonClose: true,
      proudlyDisplayPoweredByUppy: false,
    })
    .use(XHR, {
      endpoint: `${import.meta.env.VITE_DUMILI_SOCKET_URL}/upload`,
      headers: {
        "x-dumili-indexation-id": props.folderName,
        "x-token": Cookies.get("token")!,
      },
      getResponseError: (responseText) =>
        new Error(JSON.parse(responseText).error),
    });
});
</script>
