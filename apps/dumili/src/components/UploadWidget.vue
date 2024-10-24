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

const props = defineProps<{
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
    folder: `dumili/${user.value!.username}/${props.folderName}`,
    showPoweredBy: false,
    sources: ["local", "url"],
    multiple: true,
    maxFileSize: 10_000_000,
    maxImageFileSize: 5_000_000,
    context: {
      indexation: props.folderName,
      project: "dumili",
      user: user.value!.username,
    },
  },
  async (error, result) => {
    if (error) {
      console.error(error);
    } else {
      debugger;
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
  await dumiliSocket.indexations.services.createIfNotExists(props.folderName);
  dumiliSocket.setIndexationSocketFromId(props.folderName);
  indexationSocket.value = dumiliSocket.indexationSocket.value!;
  uploadWidget.open();
});
</script>
