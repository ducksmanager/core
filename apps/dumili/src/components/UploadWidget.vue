<template>
  <div />
</template>

<script setup lang="ts">
import type {
  CloudinaryCreateUploadWidget,
  CloudinaryUploadWidgetInfo,
} from "cloudinary-widget";
import { dumiliSocketInjectionKey } from "~/composables/useDumiliSocket";

import { stores as webStores } from "~web";

const dumiliSocket = inject(dumiliSocketInjectionKey)!;

const { user } = storeToRefs(webStores.collection());

const { folderName, parentSelector } = defineProps<{
  parentSelector: string;
  folderName: string;
}>();

const indexationSocket = ref<
  typeof dumiliSocket.indexationSocket.value | undefined
>();

const currentPageNumber = ref(1);

const emit = defineEmits<{
  (e: "done"): void;
  (e: "abort"): void;
}>();

declare var cloudinary: {
  createUploadWidget: CloudinaryCreateUploadWidget;
};
const uploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME,
    uploadPreset: "p1urov1k",
    folder: `dumili/${user.value!.username}/${folderName}`,
    inlineContainer: parentSelector,
    showPoweredBy: false,
    sources: ["local", "url", "camera"],
    multiple: true,
    maxFileSize: 10 * 1024 * 1024,
    maxImageFileSize: 5 * 1024 * 1024,
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
        case "success":
          const info = result.info as CloudinaryUploadWidgetInfo;
          console.log("Done! Here is the image info: ", info);

          if (info.pages) {
            for (let page = 1; page <= info.pages; page++) {
              await indexationSocket.value!.services.addPage(
                currentPageNumber.value++,
                info.secure_url
                  .replace("/upload/", `/upload/pg_${page}/`)
                  .replace(/.pdf$/g, ".png"),
              );
            }
          } else {
            await indexationSocket.value!.services.addPage(
              currentPageNumber.value++,
              info.secure_url,
            );
          }
          uploadWidget.close();
          emit("done");
          break;
        case "abort":
          emit("abort");
          break;
      }
    }
  },
);

onMounted(async () => {
  await dumiliSocket.indexations.services.create(folderName);
  dumiliSocket.setIndexationSocketFromId(folderName);
  indexationSocket.value = dumiliSocket.indexationSocket.value!;
  uploadWidget.open();
});
</script>
