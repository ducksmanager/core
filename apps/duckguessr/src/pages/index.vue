<template>
  <b-container class="d-flex flex-column align-items-center">
    <h3>{{ t("Welcome to Duckguessr!") }}</h3>
    <b-container class="d-flex flex-column align-items-center my-3">
      <iframe
        width="560"
        height="315"
        :src="`https://www.youtube.com/embed/${youtubeVideoId}?controls=0&autohide=1`"
        title="Duckguessr trailer"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </b-container>
    <h3>{{ t("Create a game") }}</h3>
    <alert-not-connected v-if="isAnonymous === true" />
    <b-card-group deck>
      <b-card
        v-for="dataset in datasets"
        :key="dataset.name"
        :title="t(dataset.title!)"
        img-top
        align="center"
        body-class="d-flex flex-column"
        :style="matchCreationSocket ? '' : 'pointer-events: none'"
        @click="createMatch(dataset.name)"
      >
        <b-card-body
          class="d-flex align-items-end my-2 p-1 bg-transparent border-0 small"
        >
          {{ t(dataset.description!) }}
        </b-card-body>
        <b-card-footer>
          {{ t("Images") }}: {{ dataset.images }}, {{ t("authors") }}:
          {{ dataset.authors }}
        </b-card-footer>
      </b-card>
    </b-card-group>
    <hr />
    <b-card-footer class="small">
      <div>
        {{ t("Duckguessr's medal pictures are made by artist") }}
        <b>Timothée Rouxel</b>.
      </div>
      <div>
        {{ t("The translation in Spanish is made by") }} <b>Rémi Barnault</b>.
      </div>
      <div>{{ t("The translation in German is made by") }} <b>TheBear</b>.</div>
      <div>
        {{ t("Part of this website's content is based on Inducks data.") }}
        <a href="https://inducks.org/inducks/COPYING">{{
          t("Click here to read the Inducks licence.")
        }}</a>
      </div>
      <div>
        {{
          t(
            "All the Disney characters and products are © The Walt Disney Company.",
          )
        }}
      </div>
    </b-card-footer>
  </b-container>
</template>

<script lang="ts" setup>
import { io, Socket } from "socket.io-client";
import { useCookies } from "@vueuse/integrations/useCookies";
import { userStore } from "~/stores/user";
import { DatasetWithCounts } from "~types/dataset";
import { ClientToServerEventsDatasets } from "~types/socketEvents";
const router = useRouter();

const { t, locale } = useI18n();

const datasets = ref([] as DatasetWithCounts[]);

const isAnonymous = computed(() => userStore().isAnonymous);
const matchCreationSocket = ref(null as Socket | null);

const youtubeVideoId = computed(() =>
  locale.value === "fr" ? "21Zfy5bOQkA" : "F0j-MMTiT3w",
);

const datasetsSocket: Socket<ClientToServerEventsDatasets> = io(
  import.meta.env.VITE_DM_SOCKET_URL + "/datasets",
);

const createMatch = (datasetName: string) => {
  matchCreationSocket.value?.emit(
    "createMatch",
    datasetName,
    (gameId: number) => {
      matchCreationSocket.value!.close();
      router.replace(`/matchmaking/${gameId}`);
    },
  );
};

watch(
  () => userStore().user?.username,
  (username) => {
    if (username) {
      matchCreationSocket.value = io(
        `${import.meta.env.VITE_DM_SOCKET_URL}/match`,
        {
          auth: {
            cookie: useCookies().getAll(),
          },
        },
      );
    }
  },
  { immediate: true },
);

(async () => {
  datasets.value = await datasetsSocket.emitWithAck("getDatasets");
})();
</script>

<style scoped lang="scss">
.card {
  color: black;
  cursor: pointer;
  padding-bottom: 20px;

  .card-footer {
    position: absolute;
    bottom: 0;
  }
}

hr + .card-footer {
  text-align: center;
  width: calc(100vw - 325px);

  @media (max-width: 992px) {
    width: 100vw;
  }
}
</style>
