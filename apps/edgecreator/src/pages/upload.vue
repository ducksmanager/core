<route lang="yaml">
meta:
  public: true
</route>
<template>
  <b-container>
    <div>
      <div
        :class="{ loader: true, 'max-height': !uploadedImageData }"
        @change="change"
        @dragover="dragover"
        @drop="drop"
      >
        <div>
          {{ $t("Drag a file here or")
          }}<label class="browse">
            {{ $t("Browse") }}
            <input id="file" class="sr-only" type="file" accept="image/jpeg" />
          </label>
        </div>
      </div>
      <template v-if="uploadedImageData">
        <div id="cropper-wrapper">
          <vue-cropper
            ref="cropper"
            alt="Source Image"
            :img-style="{ maxHeight: '100vh' }"
            :auto-crop-area="1"
            :src="uploadedImageData.url"
            :view-mode="1"
            :movable="false"
            :rotatable="false"
            :scalable="false"
            :zoomable="false"
          />
        </div>
        <b-container fluid>
          {{
            // eslint-disable-next-line max-len
            $t(
              'For each edge present on the picture, please select the part of the picture corresponding to the edge, fill in the information related to the edge hereunder then click on "Add". Once all the edges on the picture have been indicated, click on "Send the edge pictures".',
            )
          }}
        </b-container>
        <issue-select
          :key="crops.length"
          disable-ongoing-or-published
          :disable-not-ongoing-nor-published="false"
          @change="currentCrop.issuecode = $event.issuecode"
        >
          <template #dimensions>
            <dimensions v-model="currentCrop" />
          </template>
        </issue-select>
        <b-button :disabled="!currentCrop" class="mt-3 mb-4" @click="addCrop">
          {{ $t("Add") }}
        </b-button>
        <b-card-group deck columns>
          <b-card
            v-for="(crop, i) in crops"
            :key="`crop-${i}`"
            class="edge-card overflow-hidden"
            :body-class="[
              'd-flex',
              'align-items-center',
              'justify-content-around',
              'p-1',
            ]"
          >
            <template #header>
              <issue no-wrap :issuecode="crop.issuecode" />
            </template>
            <img
              class="edge-crop"
              :src="crop.url"
              :width="crop.width * 1.5"
              :height="crop.height * 1.5"
            />
            <edge-canvas
              :steps="[]"
              :issuecode="crop.issuecode"
              :dimensions="{ width: crop.width, height: crop.height }"
              :photo-url="crop.photoFileName"
              :contributors="initialContributors"
            />
            <div>
              <div v-if="crop.error" class="text-center">
                {{ $t("Error") }}
              </div>
              <div v-else-if="crop.sent" class="text-center">
                {{ $t("Sent!") }}
              </div>
              <div v-else>
                <b-button pill variant="danger" @click="crops.splice(i, 1)">
                  {{ $t("Delete") }}
                </b-button>
              </div>
            </div>
            <template #footer>
              {{ crop.width }} x {{ crop.height }} mm
            </template>
          </b-card>
        </b-card-group>
        <b-button
          v-if="crops.length && crops.some(({ sent }) => !sent)"
          class="my-3"
          style="width: 100%"
          variant="success"
          @click="uploadAll"
        >
          {{ $t("Send the edge pictures") }}
        </b-button>
        <div v-else-if="crops.length" class="my-3">
          <b-link to="/">
            {{ $t("Back to home page") }}
          </b-link>
        </div>
      </template>
    </div>
  </b-container>
</template>

<script lang="ts" setup>
import "cropperjs/dist/cropper.css";

import { useToastController } from "bootstrap-vue-next";
import type Cropper from "cropperjs";
import { nextTick } from "vue";
import VueCropper from "vue-cropperjs";
import type { CropperData } from "vue-cropperjs";
import { useI18n } from "vue-i18n";

import { edgecreatorSocketInjectionKey } from "~/composables/useEdgecreatorSocket";
import useSaveEdge from "~/composables/useSaveEdge";
import type { ModelContributor } from "~types/ModelContributor";

const i18n = useI18n();

const { upload: uploadEvents } = inject(edgecreatorSocketInjectionKey)!;

const { saveEdgeSvg } = useSaveEdge();

interface Crop {
  width: number;
  height: number;
  issuecode?: string;
  photoFileName?: string;
}
type CropWithData = Crop & {
  url: string;
  sent: boolean;
  error?: string;
};

const currentCrop = ref<Crop>({
  width: 15,
  height: 200,
});
const crops = ref<CropWithData[]>([]);
const uploadedImageData = ref<{ url: string }>();
const cropper = ref<Cropper>();

const initialContributors = computed(
  (): Omit<ModelContributor, "issuecode">[] =>
    !collection().user
      ? []
      : [
          {
            contributionType: "photographe",
            user: {
              id: collection().user!.id,
              username: collection().user!.username,
            },
          },
        ],
);

const addCrop = () => {
  const data = cropper.value!.getData() as CropperData;
  if (data.height < data.width) {
    useToastController().show!({
      props: {
        body: i18n
          .t(
            `The width of your selection is bigger than its height! Make sure that the edges appear vertically on the photo.`,
          )
          .toString(),
        title: i18n.t("Error").toString(),
      },
    });
  } else {
    crops.value.push({
      ...currentCrop.value,
      sent: false,
      url: cropper.value!.getCroppedCanvas().toDataURL("image/jpeg"),
    });
    currentCrop.value = { width: 15, height: 200 };
  }
};
const uploadAll = async () => {
  for (const crop of crops.value.filter(({ sent }) => !sent)) {
    const uploadResults = await uploadEvents.uploadFromBase64({
      issuecode: crop.issuecode!,
      data: crop.url,
      isEdgePhoto: true,
    });
    if ("error" in uploadResults) {
      window.alert(uploadResults.errorDetails);
      return;
    } else if ("fileName" in uploadResults) {
      crop.photoFileName = uploadResults.fileName;
    }
    await nextTick().then(async () => {
      const response = await saveEdgeSvg(
        crop.issuecode!,
        initialContributors.value.map((contribution) => ({
          ...contribution,
          issuecode: crop.issuecode!,
        })),
      );
      const isSuccess = response!.paths.svgPath;
      crop.sent = !!isSuccess;
    });
  }
};

const read = (files: FileList) =>
  new Promise<{
    loaded: boolean;
    name: string;
    type: string;
    url: string;
  } | void>((resolve, reject) => {
    if (!files.length) {
      resolve();
      return;
    }
    const file = files[0];
    if (file.type === "image/jpeg") {
      resolve({
        loaded: true,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    } else {
      reject(new Error(i18n.t("Please choose a JPG or JPEG file").toString()));
    }
  });
const change = (e: { target: { files: FileList; value: string } | null }) =>
  read(e.target!.files)
    .then((data) => {
      e.target!.value = "";
      update(data as { url: string });
    })
    .catch((e) => {
      e.target.value = "";
      window.alert(JSON.stringify(e));
    });
const dragover = (e: DragEvent) => e.preventDefault();
const drop = (e: DragEvent) => {
  e.preventDefault();
  read(e.dataTransfer!.files)
    .then((data) => update(data as { url: string }))
    .catch(alert);
};
const update = (data: { url: string }) => {
  uploadedImageData.value = { url: data.url };
};
</script>

<style scoped lang="scss">
#cropper-wrapper {
  max-height: 100vh;
}

.edge-card {
  max-width: 300px;
}

.loader {
  display: flex;
  overflow: hidden;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  background: #eee;
  border: 5px dashed lightgray;

  &.max-height {
    height: 100vh;
  }

  > div {
    text-align: center;
    color: #999;
  }
}

.browse {
  color: #0074d9;
  cursor: pointer;
  margin-left: 0.25rem;
}

.loader:drop {
  color: #08f;
}
</style>
