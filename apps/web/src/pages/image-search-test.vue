<route lang="yaml">
meta:
  layout: bare
  public: true
</route>
<template>
  <div>
    <h1>Image Search Test</h1>
    <b-form-checkbox v-model="isCover"
      >Search for covers (otherwise search for story first
      pages)</b-form-checkbox
    >
    <table style="width: 100%">
      <tbody>
        <tr style="width: 100%">
          <td style="width: 50%">
            <input type="file" @change="handleFileChange" />
          </td>
          <td style="width: 50%; text-align: center">
            Examples:<br />
            <img
              v-for="example in examples"
              :key="example.url"
              :class="{ disabled: example.isCover !== isCover }"
              :src="example.url"
              @click="handleExampleClick(example)"
            />
          </td>
        </tr>
      </tbody>
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
const isCover = ref(true);

type Example = {
  url: string;
  isCover: boolean;
};

const examples: Example[] = [
  {
    url: "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2018/07/fr_aljm_011a_001.jpg",
    isCover: true,
  },
  {
    url: "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2014/02/fr_tp_0024a_001.jpg",
    isCover: true,
  },
  {
    url: "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2011/01/fr_tp_0013a_001.jpg",
    isCover: true,
  },
  {
    url: "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2024/05/eg_mg_0149p053_001.jpg",
    isCover: false,
  },
  {
    url: "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/webusers/webusers/2021/06/yu_mzc_983c_001.jpg",
    isCover: false,
  },
];
const models = ref<
  {
    model: string;
    modelData: "covers" | "story first pages";
    indexSize?: number | string;
    getIndexSize: () => Promise<number | string>;
    run: (base64: string) => Promise<string>;
    time?: string;
    results?: string;
  }[]
>([
  {
    model: "Legacy (WTD 2-3)",
    modelData: "covers",
    getIndexSize: () =>
      coverIdEvents
        .getIndexSize()
        .then((result) =>
          "error" in result ? result.error : result.numberOfImages,
        ),
    run: async (base64: string) => {
      try {
        const searchResults = await coverIdEvents.searchFromCover(base64);

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
    modelData: "covers",
    getIndexSize: () => storySearchEvents.getIndexSize(true),
    run: async (base64: string) => {
      const searchResults = await storySearchEvents.findSimilarImages(
        base64,
        true,
      );
      if ("error" in searchResults) {
        return searchResults.error!;
      } else
        return JSON.stringify(
          searchResults.results.map(({ issuecode }) => issuecode),
        );
    },
  },
  {
    model: "Experimental",
    modelData: "story first pages",
    getIndexSize: () => storySearchEvents.getIndexSize(false),
    run: async (base64: string) => {
      const searchResults = await storySearchEvents.findSimilarImages(
        base64,
        false,
      );
      if ("error" in searchResults) {
        return searchResults.error!;
      } else
        return JSON.stringify(
          searchResults.results.map(({ issuecode }) => issuecode),
        );
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

const handleExampleClick = (example: Example) => {
  fetch(example.url)
    .then((response) => response.blob())
    .then(async (blob) => {
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });
      isCover.value = example.isCover;
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
      for (const model of models.value.filter(
        ({ modelData }) =>
          modelData === (isCover.value ? "covers" : "story first pages"),
      )) {
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
    model.getIndexSize().then((size) => {
      model.indexSize = size;
    });
  }
});
</script>

<style scoped lang="scss">
img {
  height: 100px;
  cursor: pointer;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>