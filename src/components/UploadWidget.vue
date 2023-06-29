<template>
  <div class="uw"></div>
</template>

<script setup lang="ts">
defineProps<{}>();
const emit = defineEmits<{
  (e: "done", info: any): void;
  (e: "abort"): void;
}>();

const uploadWidget = cloudinary.createUploadWidget(
  {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME,
    uploadPreset: "p1urov1k",
    folder: "dumili",
    cropping: true,
    sources: ["local", "url"],
    maxImageFileSize: 5000000,
  },
  (error, result) => {
    if (error) {
      console.error(error);
    } else {
      switch (result?.event) {
        case "success":
          console.log("Done! Here is the image info: ", result.info);
          emit("done", result.info);
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
