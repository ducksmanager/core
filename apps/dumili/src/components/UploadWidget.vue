<template>
  <div class="uw"></div>
</template>

<script setup lang="ts">
import { user } from "~/stores/user";

const props = defineProps<{
  folderName: string;
}>();
const emit = defineEmits<{
  (e: "done"): void;
  (e: "abort"): void;
}>();

const username = computed(() => user().user!.username);

const fullFolderName = computed(
  () => `dumili/${username.value}/${props.folderName}`
);

// eslint-disable-next-line
declare var cloudinary: any;
const uploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME,
    uploadPreset: "p1urov1k",
    folder: fullFolderName.value,
    cropping: true,
    sources: ["local", "url"],
    multiple: true,
    maxImageFileSize: 5000000,
    context: {
      indexation: props.folderName,
      project: "dumili",
      user: username.value,
    },
  },
  (error: string, result: { event: string; info: unknown }) => {
    if (error) {
      console.error(error);
    } else {
      switch (result?.event) {
        case "success":
          console.log("Done! Here is the image info: ", result.info);
          emit("done");
          break;
        case "abort":
          emit("abort");
          break;
      }
    }
  }
);

uploadWidget.open();
</script>
