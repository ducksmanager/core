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
    sources: ["local", "url"],
    multiple: true,
    maxImageFileSize: 5000000,
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
          console.log("Done! Here is the image info: ", result.info);

          await indexationSocket.value!.services.addPage(
            currentPageNumber.value++,
            (result.info as CloudinaryUploadWidgetInfo).secure_url,
          );
          emit("done");
          break;
        case "abort":
          emit("abort");
          break;
      }
    }
  },
);

uploadWidget.open();

onMounted(async () => {
  await dumiliSocket.indexations.services.createIfNotExists(props.folderName);
  dumiliSocket.setIndexationSocketFromId(props.folderName);
  indexationSocket.value = dumiliSocket.indexationSocket.value!;
  uploadWidget.open();
});
</script>
