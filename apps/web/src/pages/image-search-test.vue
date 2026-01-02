<route lang="yaml">
meta:
  layout: bare
  public: true
</route>
<template>
  <div>
    <h1>Image Search Test</h1>
    <div class="my-2">
      <label>Search for</label>
    </div>
    <b-form-radio-group
      v-model="isCover"
      :options="[
        { text: 'Covers', value: true },
        { text: 'Story first pages', value: false },
      ]"
    />
    <table class="w-100">
      <tbody>
        <tr class="w-100">
          <td class="w-50">
            <input type="file" @change="handleFileChange" />
          </td>
          <td class="w-50 text-center">
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
        <tr class="w-100">
          <td colspan="2" class="text-center">
            <div v-if="!isWebcamActive" class="mt-3">
              <b-button variant="primary" @click="handleStartWebcam"
                >Start Webcam</b-button
              >
            </div>
            <div v-else class="mt-3">
              <div class="webcam-container">
                <video
                  ref="videoElement"
                  autoplay
                  playsinline
                  class="webcam-preview"
                />
              </div>
              <div class="mt-2">
                <b-button variant="success" class="mr-2" @click="captureFrame"
                  >Capture & Search</b-button
                >
                <b-button
                  :variant="isStreaming ? 'warning' : 'info'"
                  class="mr-2"
                  @click="toggleStreaming"
                >
                  {{ isStreaming ? "Stop Streaming" : "Stream & Search" }}
                </b-button>
                <b-button variant="danger" @click="handleStopWebcam"
                  >Stop Webcam</b-button
                >
              </div>
            </div>
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
    >
      <template #cell(results)="row">
        <template v-if="row.item.results">
          <div v-if="'error' in row.item.results">
            {{ row.item.results.error }}
          </div>
          <div v-else>
            <b-table
              class="results"
              :items="row.item.results"
              :fields="['score', 'fullUrl']"
              small
              responsive
            >
              <template #cell(fullUrl)="result">
                <img
                  :src="CLOUDINARY_URL + result.item.fullUrl"
                  class="img-fluid"
                />
              </template>
            </b-table></div
        ></template>
      </template>
    </b-table>
  </div>
</template>

<script setup lang="ts">
import { socketInjectionKey } from "../composables/useDmSocket";
import { getImageVector } from "../utils/wasm-image-search";

const { coverId: coverIdEvents, storySearch: storySearchEvents } =
  inject(socketInjectionKey)!;

const currentBase64 = ref<string>();
const isCover = ref(true);
const videoElement = useTemplateRef<HTMLVideoElement>("videoElement");
const isStreaming = ref(false);
const allModelsCompleted = ref(true);
const isSearching = ref(false);

const {
  stream,
  start: startWebcam,
  stop: stopWebcam,
  enabled: isWebcamActive,
} = useUserMedia({
  constraints: {
    video: { facingMode: "environment" }, // Prefer back camera on mobile
    audio: false,
  },
});

watchEffect(() => {
  if (videoElement.value) {
    videoElement.value.srcObject = stream.value || null;
  }
});

// Stop streaming when webcam is stopped
watch(isWebcamActive, (active) => {
  if (!active) {
    isStreaming.value = false;
    isSearching.value = false;
    allModelsCompleted.value = true;
  }
});

type Example = {
  url: string;
  isCover: boolean;
};

type Results =
  | {
      error: string;
    }
  | {
      score: number;
      fullUrl: string;
    }[];

const CLOUDINARY_URL =
  "https://res.cloudinary.com/dl7hskxab/image/upload/inducks-covers/";

const examples = [
  {
    url: `${CLOUDINARY_URL}webusers/webusers/2018/07/fr_aljm_011a_001.jpg`,
    isCover: true,
  },
  {
    url: `${CLOUDINARY_URL}webusers/webusers/2014/02/fr_tp_0024a_001.jpg`,
    isCover: true,
  },
  {
    url: `${CLOUDINARY_URL}webusers/webusers/2011/01/fr_tp_0013a_001.jpg`,
    isCover: true,
  },
  {
    url: `${CLOUDINARY_URL}webusers/webusers/2024/05/eg_mg_0149p053_001.jpg`,
    isCover: false,
  },
  {
    url: `${CLOUDINARY_URL}webusers/webusers/2021/06/yu_mzc_983c_001.jpg`,
    isCover: false,
  },
] as const;
const models = ref<
  {
    model: string;
    modelData: "covers" | "story first pages";
    indexSize?: number | { error: string };
    getIndexSize: () => Promise<number | { error: string }>;
    run: (base64: string) => Promise<Results>;
    time?: string;
    results?: Results;
  }[]
>([
  {
    model: "Legacy (WTD 2-3)",
    modelData: "covers",
    getIndexSize: () =>
      coverIdEvents
        .getIndexSize()
        .then((result) => ("error" in result ? result : result.numberOfImages)),
    run: async (base64: string) => {
      try {
        const searchResults = await coverIdEvents.searchFromCover(base64);

        return "error" in searchResults
          ? { error: searchResults.errorDetails || "Error" }
          : searchResults.covers.filter((_, index) => index < 5);
      } catch (error) {
        return typeof error === "object" && "errorDetails" in error!
          ? { error: (error.errorDetails as string) || "Error" }
          : { error: "Error" };
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
        return { error: searchResults.error! };
      } else return searchResults.results;
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
        return { error: searchResults.error! };
      } else return searchResults.results;
    },
  },
  {
    model: "Experimental (WASM)",
    modelData: "covers",
    getIndexSize: () => storySearchEvents.getIndexSize(true),
    run: async (base64: string) => {
      try {
        const vector = await getImageVector(base64);
        const vectorArray = Array.from(vector);
        const searchResults =
          await storySearchEvents.findSimilarImagesFromVector(
            vectorArray,
            true,
          );
        if ("error" in searchResults) {
          return { error: searchResults.error! };
        } else return searchResults.results;
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "WASM inference failed",
        };
      }
    },
  },
  {
    model: "Experimental (WASM)",
    modelData: "story first pages",
    getIndexSize: () => storySearchEvents.getIndexSize(false),
    run: async (base64: string) => {
      try {
        const vector = await getImageVector(base64);
        const vectorArray = Array.from(vector);
        const searchResults = await (
          storySearchEvents as typeof storySearchEvents & {
            findSimilarImagesFromVector: (
              vector: number[],
              isCover: boolean,
            ) => Promise<
              | { error: string }
              | { results: { score: number; fullUrl: string }[] }
            >;
          }
        ).findSimilarImagesFromVector(vectorArray, false);
        if ("error" in searchResults) {
          return { error: searchResults.error! };
        } else return searchResults.results;
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "WASM inference failed",
        };
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

const handleExampleClick = (example: Example) => {
  fetch(example.url)
    .then((response) => response.blob())
    .then(async (blob) => {
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });
      isCover.value = example.isCover;
      currentBase64.value = await toBase64(file);
    });
};

const handleStartWebcam = async () => {
  try {
    await startWebcam();
  } catch (error) {
    console.error("Error accessing webcam:", error);
    alert("Failed to access webcam. Please check permissions.");
  }
};

const captureFrame = () => {
  if (!videoElement.value) return;

  const video = videoElement.value;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0);
  canvas.toBlob(
    async (blob) => {
      if (blob) {
        const file = new File([blob], "webcam-capture.jpg", {
          type: "image/jpeg",
        });
        currentBase64.value = await toBase64(file);
      }
    },
    "image/jpeg",
    0.95,
  );
};

const captureFrameAsync = (): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!videoElement.value) {
      reject(new Error("Video element not available"));
      return;
    }

    const video = videoElement.value;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], "webcam-capture.jpg", {
            type: "image/jpeg",
          });
          const base64 = await toBase64(file);
          resolve(base64);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/jpeg",
      0.95,
    );
  });

const streamAndSearch = async () => {
  while (isStreaming.value) {
    // Wait for all models to complete before capturing next frame
    if (!allModelsCompleted.value) {
      // Wait for completion
      await new Promise<void>((resolve) => {
        const unwatch = watch(allModelsCompleted, (completed) => {
          if (completed) {
            unwatch();
            resolve();
          }
        });
      });
    }

    // Check if streaming was stopped while waiting
    if (!isStreaming.value) break;

    // Capture and search
    try {
      const base64 = await captureFrameAsync();
      currentBase64.value = base64;
    } catch (error) {
      console.error("Error capturing frame:", error);
      // Continue streaming even if one capture fails
    }
  }
};

const toggleStreaming = () => {
  if (isStreaming.value) {
    isStreaming.value = false;
  } else {
    isStreaming.value = true;
    allModelsCompleted.value = true; // Reset to allow immediate capture
    streamAndSearch();
  }
};

const handleStopWebcam = () => {
  isStreaming.value = false;
  stopWebcam();
};

watch(currentBase64, (base64) => {
  if (base64 && !isSearching.value) {
    isSearching.value = true;
    allModelsCompleted.value = false;
    // Clear time to show new search is in progress, but keep previous results
    for (const model of models.value) {
      model.time = undefined;
      // Keep model.results to show previous matches
    }
    nextTick(async () => {
      const relevantModels = models.value.filter(
        ({ modelData }) =>
          modelData === (isCover.value ? "covers" : "story first pages"),
      );
      await Promise.all(
        relevantModels.map(async (model) => {
          const start = performance.now();
          const interval = setInterval(() => {
            model.time = `${(performance.now() - start).toFixed()}ms`;
          }, 10);
          // Update results only when new ones arrive
          model.results = await model.run(base64);
          clearInterval(interval);
        }),
      );
      currentBase64.value = undefined;
      allModelsCompleted.value = true;
      isSearching.value = false;
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

onUnmounted(() => {
  handleStopWebcam();
});
</script>

<style scoped lang="scss">
:deep(.results) {
  td {
    width: 50%;
  }
}

img {
  cursor: pointer;
  height: 100px;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.webcam-container {
  position: relative;
  width: 100px;
  height: 150px;
  margin: 0 auto; /* Center the container */
  border: 2px solid #007bff;
  border-radius: 4px;
  background: #000;
  overflow: hidden;
}

.webcam-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Crop to fill the container while maintaining video's aspect ratio */
  display: block;
}
</style>