<route lang="yaml">
meta:
  layout: bare
  public: true
</route>
<template>
  <div>
    <h1>Image Search Test</h1>
    <table style="width: 100%">
      <tr style="width: 100%">
        <td style="width: 50%">
          <input type="file" @change="handleFileChange" />
        </td>
        <td style="width: 50%; text-align: center">
          Examples:<br />
          <img
            v-for="example in examples"
            :key="example"
            style="height: 100px; cursor: pointer"
            :src="example"
            @click="handleExampleClick(example)"
          />
        </td>
      </tr>
    </table>
    <b-table
      :items="models"
      :fields="['model', 'modelData', 'indexSize', 'time', 'results']"
      hover
      small
      caption-top
      responsive
    />
  </div>
</template> 

<script setup lang="ts">
import { socketInjectionKey } from "../composables/useDmSocket";

const { coverId: coverIdEvents, storySearch: storySearchEvents } =
  inject(socketInjectionKey)!;

const currentBase64 = ref<string>();

const examples = [
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2018/07/fr_aljm_011a_001.jpg",
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2014/02/fr_tp_0024a_001.jpg",
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2024/05/eg_mg_0149p053_001.jpg",
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2011/01/fr_tp_0013a_001.jpg",
];
const models = ref<
  {
    model: string;
    modelData: string;
    indexSize?: number | string;
    getIndexSize: () => Promise<number | string>;
    run: (base64: string) => Promise<string>;
    time?: string;
    results?: string;
  }[]
>([
  {
    model: "Legacy (WTD 2-3)",
    modelData: "",
    getIndexSize: () =>
      coverIdEvents
        .getIndexSize()
        .then((result) =>
          "error" in result ? result.error : result.numberOfImages,
        ),
    run: async (base64: string) => {
      try {
        const searchResults = await coverIdEvents.searchFromCover({ base64 });

        return "error" in searchResults
          ? searchResults.errorDetails || "Error"
          : JSON.stringify(
              searchResults.covers.map(({ issuecode }) => issuecode),
            );
      } catch (error) {
        return typeof error === "object" && "errorDetails" in error!
          ? (error.errorDetails as string) || "Error"
          : "Error";
      }
    },
  },
  {
    model: "Experimental",
    modelData: "",
    getIndexSize: () => storySearchEvents.getIndexSize(),
    run: async (base64: string) => {
      try {
        const searchResults = await storySearchEvents.findSimilarImages(base64);
        return JSON.stringify(searchResults.map(({ issuecode }) => issuecode));
      } catch (error) {
        return typeof error === "object" && "errorDetails" in error!
          ? (error.errorDetails as string) || "Error"
          : "Error";
      }
    },
  },
]);
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    currentBase64.value = await toBase64(file);
  }
};

const handleExampleClick = (url: string) => {
  fetch(url)
    .then((response) => response.blob())
    .then(async (blob) => {
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });
      currentBase64.value = await toBase64(file);
    });
};

watch(currentBase64, (base64) => {
  if (base64) {
    for (const model of models.value) {
      model.time = undefined;
      model.results = undefined;
    }
    nextTick(async () => {
      for (const model of models.value) {
        const start = performance.now();
        const interval = setInterval(() => {
          model.time = `${(performance.now() - start).toFixed()}ms`;
        }, 10);
        model.results = await model.run(base64);
        clearInterval(interval);
        currentBase64.value = undefined;
      }
    });
  }
});

onMounted(async () => {
  for (const model of models.value) {
    model.indexSize = await model.getIndexSize();
  }
});
</script>
