<template>
  <div class="uw">
    <h3>Upload Widget Example</h3>
    <button v-on:click="open" id="upload_widget" class="cloudinary-button">
      Upload files
    </button>
  </div>
</template>

<script setup lang="ts">
const cloudName = "dl7hskxab"; // replace with your own cloud name

defineProps<{}>();

const myWidget = cloudinary.createUploadWidget(
  {
    cloudName: cloudName,
    uploadPreset: "p1urov1k",
    folder: "dumili",
    cropping: true, //add a cropping step
    sources: ["local", "url"], // restrict the upload sources to URL and local files
    maxImageFileSize: 5000000, //restrict file size to less than 2MB
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info);
    }
  }
);

const open = () => {
  myWidget.open();
};
</script>
