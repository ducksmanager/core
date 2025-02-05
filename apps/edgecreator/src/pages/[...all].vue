<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div>
    <session-info />
    <h1>{{ $t("Dashboard") }}</h1>

    <b-alert
      v-if="!Object.keys(ongoingEdges).length"
      variant="info"
      :model-value="true"
    >
      {{ $t("Loading...") }}
    </b-alert>

    <template v-else>
      <h3>{{ $t("Edge creation") }}</h3>

      <b-container v-if="isUploadableEdgesCarouselReady" align="center">
        <b-alert variant="info" :model-value="true">
          <template v-if="mostPopularIssuesInCollectionWithoutEdge?.length">
            <uploadable-edges-carousel
              :user-points="userPhotographerPoints"
              :issues="mostPopularIssuesInCollectionWithoutEdge"
            >
              <template #header>
                {{
                  $t(
                    "Send us photos of magazine edges that you own and earn up to {0} Edge photographer points per edge!",
                    [mostPopularIssuesInCollectionWithoutEdge[0].popularity],
                  )
                }}
              </template>
            </uploadable-edges-carousel>
            <div>
              <hr />
              <div class="position-absolute px-2 separation-text">
                {{ $t("or") }}
              </div>
            </div>
          </template>
          <uploadable-edges-carousel
            v-if="mostWantedEdges"
            :user-points="userPhotographerPoints"
            :issues="mostWantedEdges"
          >
            <template #header>
              {{
                $t(
                  "Send us photos of magazine edges that you find on the Internet and earn up to {0} Edge photographer points per edge!",
                  [mostWantedEdges[0].popularity],
                )
              }}
            </template>
          </uploadable-edges-carousel>
          <b-button to="/upload" class="mt-1">
            {{ $t("Send edge photos") }}
          </b-button>
        </b-alert>
      </b-container>

      <b-container
        v-if="hasRole('Edition') || hasRole('Admin')"
        class="mt-3"
        align="center"
      >
        <b-button to="/edit/new">
          {{ $t("Create or edit an edge model") }}
        </b-button>
      </b-container>

      <hr />

      <template
        v-for="status in ['Ongoing', 'Ongoing by another user', 'Pending edition'] as const"
        :key="`${status}`"
      >
        <h3>{{ $t(status) }}</h3>

        <b-container
          v-if="
            Object.keys(edgesByStatusAndPublicationcode[status] || []).length
          "
        >
          <template
            v-for="(edges, publicationcode) in edgesByStatusAndPublicationcode[
              status
            ]"
            :key="`${status}-${publicationcode}`"
          >
            <b-row>
              <b-col>
                <publication
                  :publicationname="
                    publicationNames[publicationcode] || publicationcode
                  "
                  :publicationcode="publicationcode"
                  display-class="d-inline-block"
                />
                <b-link
                  class="mx-3"
                  :to="`edit/${edges.map((edge) => edge.issuecode.replaceAll(' ', '_')).join(',')}`"
                >
                  <b-button
                    v-if="canEditEdge(status)"
                    size="sm"
                    variant="outline-secondary"
                  >
                    {{ $t("Edit all") }} ({{ edges.length }})
                  </b-button>
                </b-link>
              </b-col>
            </b-row>
            <b-row>
              <b-col
                v-for="(edge, i) in edges"
                :key="`${status}-${i}`"
                align-self="center"
                cols="12"
                md="6"
                lg="3"
                @mouseover="hoveredEdge = edge!"
                @mouseout="hoveredEdge = undefined"
              >
                <b-card class="text-center">
                  <b-link
                    :to="`edit/${edge.issuecode.replaceAll(' ', '_')}`"
                    :disabled="!canEditEdge(status)"
                  >
                    <b-card-text>
                      <img
                        v-if="hoveredEdge === edge"
                        :alt="edge.issuecode"
                        class="edge-preview"
                        :src="getSvgUrl(edge)"
                      /><edge-link
                        :issuecode="edge.issuecode"
                        :designers="edge.designers"
                        :photographers="edge.photographers"
                        :published="false"
                      />
                    </b-card-text>
                  </b-link>
                </b-card>
              </b-col>
            </b-row>
          </template>
        </b-container>
        <div v-else align="center">
          {{ $t("No edge in this category") }}
        </div>
      </template>
    </template>

    <b-container align="center" class="m-5"> &nbsp; </b-container>

    <b-container
      id="footer"
      class="position-fixed text-center w-100 bg-light p-2"
    >
      {{
        $t(
          "EdgeCreator is a tool allowing to create edges for the DucksManager bookcase.",
        )
      }}<br /><a href="https://ducksmanager.net">{{
        $t("Go to DucksManager")
      }}</a>
    </b-container>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from "pinia";

import { edgeCatalog } from "~/stores/edgeCatalog";

const { edges: edgesEvents } = inject(dmSocketInjectionKey)!;

import { stores as webStores } from "~web";
import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";
import type { BookcaseEdgeWithPopularity } from "~web/src/stores/bookcase";

const collectionStore = webStores.collection();
const bookcaseStore = webStores.bookcase();
const usersStore = webStores.users();
const coaStore = webStores.coa();
const { hasRole } = collectionStore;
const { user } = storeToRefs(collectionStore);

const edgeCatalogStore = edgeCatalog();
const { fetchOngoingEdges, canEditEdge } = edgeCatalogStore;
const { ongoingEdges } = storeToRefs(edgeCatalogStore);

const edgesByStatusAndPublicationcode = computed(() => {
  const edgesByStatus = Object.values(ongoingEdges.value || []).groupBy(
    "status",
    "[]",
  );
  return Object.fromEntries(
    Object.entries(edgesByStatus).map(([status, edges]) => [
      status,
      edges.groupBy("publicationcode", "[]"),
    ]),
  );
});
const userPhotographerPoints = computed(
  () => usersStore.points[user.value!.id].edge_photographer,
);

const { publicationNames, issuecodeDetails } = storeToRefs(webStores.coa());

const isUserBookcaseReady = ref(false);
const isCatalogReady = ref(false);

const isUploadableEdgesCarouselReady = computed(
  () => isUserBookcaseReady.value && isCatalogReady.value,
);

const mostWantedEdges = ref<
  (BookcaseEdgeWithPopularity & {
    publicationcode: string | null;
    issuenumber: string | null;
  })[]
>();

const hoveredEdge = ref();

const mostPopularIssuesInCollectionWithoutEdge = computed(() =>
  collectionStore.popularIssuesInCollectionWithoutEdge
    ?.sort(
      ({ popularity: popularity1 }, { popularity: popularity2 }) =>
        (popularity2 ?? 0) - (popularity1 ?? 0),
    )
    .filter((_, index) => index < 10),
);

const getSvgUrl = (edge: { svgPath: string }) =>
  edge.svgPath ? `${import.meta.env.VITE_EDGES_URL}${edge.svgPath}` : undefined;

const loadMostWantedEdges = async () => {
  const wantedEdges = await edgesEvents.getWantedEdges();
  await coaStore.fetchIssuecodeDetails(
    wantedEdges.map(({ issuecode }) => issuecode),
  );
  mostWantedEdges.value = wantedEdges
    .slice(0, 10)
    .map(
      ({
        issuecode,
        numberOfIssues,
      }: {
        issuecode: string;
        numberOfIssues: number;
      }) => ({
        ...issuecodeDetails.value[issuecode],
        id: 0,
        edgeId: 0,
        creationDate: new Date(),
        timestamp: new Date().getTime(),
        sprites: [],
        slug: "",
        points: numberOfIssues,
        popularity: numberOfIssues,
      }),
    );
};

watch(
  user,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    await usersStore.fetchStats([user.value!.id]);
    await collectionStore.loadPopularIssuesInCollection();
    await bookcaseStore.loadBookcase();
    isUserBookcaseReady.value = true;
  },
  { immediate: true },
);

(async () => {
  await loadMostWantedEdges();
  await fetchOngoingEdges();
  await coaStore.fetchIssuecodeDetails(
    Object.keys(ongoingEdges.value).map((issuecode) => issuecode),
  );
  const publicationcodes = [
    ...mostWantedEdges.value!.map(({ issuecode }) => issuecode),
    ...Object.values(ongoingEdges.value).map(({ issuecode }) => issuecode),
  ].map(
    (issuecode) =>
      issuecodeDetails.value[issuecode]?.publicationcode || "fr/JM",
  );

  await coaStore.fetchPublicationNames(publicationcodes);
  isCatalogReady.value = true;
})();
</script>
<style scoped lang="scss">
:deep(.carousel) {
  height: 100px;

  * {
    line-height: 10px;
    font-size: 11px !important;

    a span {
      color: #666;
    }
  }
}

.card {
  margin: 15px 0;

  .edge-preview {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
  }
}

.disabled {
  pointer-events: none;
}

.separation-text {
  margin-top: -30px !important;
  background: var(--bs-info-bg-subtle);
  left: 50%;
}

#footer {
  bottom: 0;
  max-width: 100%;
}
</style>
