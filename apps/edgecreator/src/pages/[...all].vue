<route lang="yaml">
meta:
  public: true
</route>
<template>
  <div>
    <session-info />
    <h1>{{ $t("Dashboard") }}</h1>

    <b-alert v-if="!isCatalogLoaded" variant="info" :model-value="true">{{
      $t("Loading...")
    }}</b-alert>

    <template v-else>
      <h3>{{ $t("Edge creation") }}</h3>

      <b-container v-if="isUploadableEdgesCarouselReady" align="center">
        <b-alert variant="info" :model-value="true">
          <template v-if="mostPopularIssuesInCollectionWithoutEdge?.length">
            <uploadable-edges-carousel
              :user-points="collectionStore.userPhotographerPoints"
              :issues="mostPopularIssuesInCollectionWithoutEdge"
              :publication-names="publicationNames"
            >
              <template #header>
                {{
                  $t(
                    "Send us photos of magazine edges that you own and earn up to {0} Edge photographer points per edge!",
                    [mostPopularIssuesInCollectionWithoutEdge[0].popularity]
                  )
                }}
              </template>
            </uploadable-edges-carousel>
            <div>
              <div class="position-absolute px-2 separation-text">
                {{ $t("or") }}
              </div>
              <hr />
            </div>
          </template>
          <uploadable-edges-carousel
            v-if="mostWantedEdges"
            :user-points="collectionStore.userPhotographerPoints"
            :issues="mostWantedEdges"
            :publication-names="publicationNames"
          >
            <template #header>
              {{
                $t(
                  "Send us photos of magazine edges that you find on the Internet and earn up to {0} Edge photographer points per edge!",
                  [mostWantedEdges[0].popularity]
                )
              }}
            </template>
          </uploadable-edges-carousel>
          <b-button to="/upload" class="mt-1">{{
            $t("Send edge photos")
          }}</b-button>
        </b-alert>
      </b-container>

      <b-container
        v-if="hasRole('Edition') || hasRole('Admin')"
        class="mt-3"
        align="center"
      >
        <b-button to="/edit/new">{{
          $t("Create or edit an edge model")
        }}</b-button>
      </b-container>

      <hr />

      <template v-for="{ status, l10n } in edgeCategories" :key="`${status}`">
        <h3>{{ $t(l10n) }}</h3>

        <b-container v-if="Object.keys(edgesByStatus[status]).length">
          <template
            v-for="(edges, publicationcode) in edgesByStatus[status]"
            :key="`${status}-${publicationcode}`"
          >
            <b-row>
              <b-col>
                <publication
                  :publicationname="publicationNames[publicationcode]"
                  :publicationcode="publicationcode"
                  display-class="d-inline-block"
                />
                <b-link
                  class="mx-3"
                  :to="`edit/${publicationcode} ${edges
                    .map((edge) => edge.issuenumber)
                    .join(',')}`"
                  ><b-button
                    v-if="canEditEdge(status)"
                    size="sm"
                    variant="outline-secondary"
                    >{{ $t("Edit all") }} ({{ edges.length }})</b-button
                  ></b-link
                >
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
              >
                <b-card class="text-center">
                  <b-link
                    :to="`edit/${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                    :disabled="!canEditEdge(status)"
                  >
                    <b-card-text>
                      <img
                        v-if="edge.v3 || status === 'pending'"
                        :alt="`${edge.country}/${edge.magazine} ${edge.issuenumber}`"
                        class="edge-preview"
                        :src="
                          edge.v3
                            ? getEdgeUrl(
                                edge.country,
                                edge.magazine,
                                edge.issuenumber,
                                'svg',
                                false
                              )
                            : getPhotoUrl(edge.country, edge.photo)
                        "
                      /><edge-link
                        :publicationcode="`${edge.country}/${edge.magazine}`"
                        :issuenumber="edge.issuenumber"
                        :designers="edge.designers"
                        :photographers="edge.photographers"
                        :published="edge.published === 'Published'"
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

    <b-container align="center" class="m-5">&nbsp;</b-container>

    <b-container
      id="footer"
      class="position-fixed text-center w-100 bg-light p-2"
      >{{
        $t(
          "EdgeCreator is a tool allowing to create edges for the DucksManager bookcase."
        )
      }}<br /><a href="https://ducksmanager.net">{{
        $t("Go to DucksManager")
      }}</a></b-container
    >
  </div>
</template>
<script setup lang="ts">
import useEdgeCatalog from "~/composables/useEdgeCatalog";
import usePermissions from "~/composables/usePermissions";
import { api } from "~/stores/api";
import { coa } from "~/stores/coa";
import { BookcaseEdgeWithPopularity, collection } from "~/stores/collection";
import { edgeCatalog as edgeCatalogStore } from "~/stores/edgeCatalog";
import { GET__edges__wanted__data } from "~dm_types/routes";

import { call } from "../../axios";

const { getEdgeUrl } = useSvgUtils();
const { hasRole } = usePermissions();
const publicationNames = computed(() => coa().publicationNames);

const {
  edgesByStatus,
  canEditEdge,
  loadCatalog,
  edgeCategories,
  isCatalogLoaded,
} = useEdgeCatalog();
const collectionStore = collection();

const isUploadableEdgesCarouselReady = ref(false as boolean);
const mostWantedEdges = ref(null as BookcaseEdgeWithPopularity[] | null);

const mostPopularIssuesInCollectionWithoutEdge = computed(() =>
  collectionStore.popularIssuesInCollectionWithoutEdge
    ?.sort(
      (
        { popularity: popularity1 }: { popularity: number | null },
        { popularity: popularity2 }: { popularity: number | null }
      ) => (popularity2 || 0) - (popularity1 || 0)
    )
    .filter((_, index) => index < 10)
);

const getPhotoUrl = (country: string, fileName: string) =>
  `${import.meta.env.VITE_EDGES_URL_PUBLIC}/${country}/photos/${fileName}`;

const loadMostWantedEdges = async () => {
  mostWantedEdges.value = (
    await call(api().dmApi, new GET__edges__wanted__data())
  ).data
    .slice(0, 10)
    .map(
      ({
        publicationcode,
        issuenumber,
        numberOfIssues,
      }: {
        publicationcode: string;
        issuenumber: string;
        numberOfIssues: number;
      }) => ({
        id: 0,
        edgeId: 0,
        creationDate: new Date(),
        sprites: [],
        countryCode: publicationcode.split("/")[0],
        magazineCode: publicationcode.split("/")[0],
        issueCode: `${publicationcode} ${issuenumber}`,
        publicationcode,
        issuenumber,
        issuenumberReference: "",
        popularity: numberOfIssues,
      })
    );
};

(async () => {
  await collectionStore.fetchUserPoints();
  await collectionStore.loadPopularIssuesInCollection();
  await collectionStore.loadBookcase();
  await loadMostWantedEdges();
  await loadCatalog(true);
  await coa().fetchPublicationNames([
    ...new Set([
      ...collectionStore.bookcase!.map(
        ({ countryCode, magazineCode }) => `${countryCode}/${magazineCode}`
      ),
      ...mostWantedEdges.value!.map(({ publicationcode }) => publicationcode),
      ...Object.values(edgeCatalogStore().currentEdges).map(
        ({ country, magazine }) => `${country}/${magazine}`
      ),
    ]),
  ]);
  isUploadableEdgesCarouselReady.value = true;
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
  margin-top: -12px !important;
  background: #d1ecf1;
  left: 50%;
}

#footer {
  bottom: 0;
  max-width: 100%;
}
</style>
