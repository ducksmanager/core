<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <div v-if="hasData">
    <div
      v-for="mostWantedIssue in mostWantedItems"
      :key="`wanted-${mostWantedIssue.issuecode.replaceAll(' ', '_')}`"
    >
      <div>
        <u
          >{{ mostWantedIssue.numberOfIssues }} utilisateurs possèdent le numéro
          :</u
        >
      </div>
      &nbsp;
      <img
        :src="
          getImagePath(`flags/${mostWantedIssue.issuecode.split('/')[0]}.png`)
        "
      />
      {{ publicationNames[mostWantedIssue.publicationcode] }} n°{{
        mostWantedIssue.issuenumber
      }}
    </div>
    <div
      v-if="
        publishedEdgesByPublicationcode &&
        issuesByIssuecode &&
        inducksIssuenumbers &&
        Object.keys(inducksIssuenumbers).length
      "
    >
      <div
        v-for="[publicationcode, issuesForPublication] of Object.entries(
          publishedEdgesByPublicationcode,
        )"
        :key="publicationcode"
        v-memo="[
          publicationcode,
          showEdgesForPublication.includes(publicationcode),
        ]"
        class="publication"
      >
        <i-bi-eye-fill
          v-if="!showEdgesForPublication.includes(publicationcode)"
          @click="expandPublication(publicationcode)"
        />
        <i-bi-eye-slash-fill
          v-else
          @click="
            showEdgesForPublication.splice(
              showEdgesForPublication.indexOf(publicationcode),
              1,
            )
          "
        />
        <Publication
          :publicationcode="publicationcode"
          :publicationname="publicationcode"
        >
          <b class="mx-1">{{ publicationNames[publicationcode] }}</b>
        </Publication>
        <div v-if="inducksIssuenumbers[publicationcode]">
          <Bookcase
            v-if="showEdgesForPublication.includes(publicationcode)"
            :bookcase-textures="bookcaseTextures"
            :sorted-bookcase="sortedBookcase[publicationcode]"
          />
          <span
            v-for="inducksIssuecode in issuecodesByPublicationcode[
              publicationcode
            ]"
            v-else
            :key="inducksIssuecode"
          >
            <span
              class="num bordered"
              :class="{
                available: issuesForPublication
                  .map(({ issuecode }) => issuecode)
                  ?.includes(inducksIssuecode),
                owned: issuesByIssuecode[inducksIssuecode]!!,
              }"
              :title="inducksIssuecode"
              @click="open(inducksIssuecode)"
              >&nbsp;</span
            >
          </span>
        </div>
        <div v-else>
          Certaines tranches de cette publication sont prêtes mais la
          publication n'existe plus sur Inducks :
          {{ issuesForPublication.join(", ") }}
        </div>
      </div>
      <br /><br />
      <b>{{ publishedEdges.data.value?.length ?? 0 }} tranches prêtes.</b><br />
      <br /><br />
      <u>Légende : </u><br />
      <span class="num">&nbsp;</span> Nous avons besoin d'une photo de cette
      tranche !<br />
      <span class="num available">&nbsp;</span> Cette tranche est prête.<br />
    </div>
  </div>
  <div v-else>
    {{ $t("Chargement...") }}
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { socketInjectionKey } from "../../../composables/useDmSocket";

const { getImagePath } = images();

const showEdgesForPublication = ref<string[]>([]);
const bookcaseTextures = {
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
};

const { edges: edgesEvents } = inject(socketInjectionKey)!;

const mostWanted = useQuery({
  key: ["edges", "wanted"],
  query: () => edgesEvents.getWantedEdges(),
});

const mostWantedItems = computed(
  () => mostWanted.data.value?.filter((item) => item != null) ?? [],
);

const publishedEdges = useQuery({
  key: ["edges", "published"],
  query: () => edgesEvents.getPublishedEdges(),
});

const {
  fetchPublicationNames,
  fetchIssuecodesByPublicationcode,
  fetchIssuecodeDetails,
} = coa();
const { publicationNames, issuecodesByPublicationcode, issuecodeDetails } =
  storeToRefs(coa());

const { loadCollection } = collection();
const { issuesByIssuecode } = storeToRefs(collection());

const publishedEdgesByPublicationcode = computed(() =>
  publishedEdges.data.value?.groupBy("publicationcode", "[]"),
);

const isValidCode = (code: string | undefined): code is string =>
  Boolean(code && code !== "undefined");

const publicationcodesToFetch = computed(() => [
  ...new Set([
    ...(mostWanted.data.value ?? []).map((m) => m.publicationcode),
    ...Object.keys(
      (publishedEdges.data.value ?? []).groupBy?.("publicationcode") ?? {},
    ).filter(isValidCode),
  ]),
]);

const publishedPublicationcodes = computed(() =>
  Object.keys(
    (publishedEdges.data.value ?? []).groupBy?.("publicationcode") ?? {},
  ).filter(isValidCode),
);

const publishedIssuecodes = computed(() =>
  Object.keys(
    (publishedEdges.data.value ?? []).groupBy?.("issuecode") ?? {},
  ).filter(isValidCode),
);

// Dependent queries – run when primary data is ready
useQuery({
  key: () => [
    "progress",
    "publicationNames",
    [...publicationcodesToFetch.value].sort().join(","),
  ],
  query: () => fetchPublicationNames(publicationcodesToFetch.value),
  enabled: () => publicationcodesToFetch.value.length > 0,
});

useQuery({
  key: () => [
    "progress",
    "issuecodesByPublicationcode",
    [...publishedPublicationcodes.value].sort().join(","),
  ],
  query: () =>
    fetchIssuecodesByPublicationcode(publishedPublicationcodes.value),
  enabled: () => publishedPublicationcodes.value.length > 0,
});

useQuery({
  key: () => [
    "progress",
    "issuecodeDetails",
    [...publishedIssuecodes.value].sort().join(","),
  ],
  query: () => fetchIssuecodeDetails(publishedIssuecodes.value),
  enabled: () => publishedIssuecodes.value.length > 0,
});

useQuery({
  key: ["progress", "collection"],
  query: () => loadCollection(),
  enabled: () => publicationcodesToFetch.value.length > 0,
});

const getEdgeUrl = (issuecode: string): string => {
  const { publicationcode, issuenumber } = issuecodeDetails.value[issuecode];
  const [country, magazine] = publicationcode.split("/");
  return `${
    import.meta.env.VITE_EDGES_ROOT
  }/${country}/gen/${magazine}.${issuenumber.replaceAll(" ", "")}.png`;
};
const open = (inducksIssuecode: string) => {
  if (
    publishedEdges.data.value
      ?.map(({ issuecode }) => issuecode)
      .includes(inducksIssuecode)
  ) {
    window.open(getEdgeUrl(inducksIssuecode), "_blank");
  }
};
const inducksIssuenumbers = computed(() =>
  Object.entries(issuecodesByPublicationcode.value)
    .flatMap(([publicationcode, issuecodes]) =>
      (issuecodes ?? [])
        .filter((issuecode) => issuecode in issuecodeDetails.value)
        .map((issuecode) => ({
          publicationcode,
          issuenumber: issuecodeDetails.value[issuecode].issuenumber.replaceAll(
            " ",
            "",
          ),
        })),
    )
    .groupBy("publicationcode", "issuenumber[]"),
);

const sortedBookcase = computed(() =>
  showEdgesForPublication.value
    .flatMap((publicationcode) =>
      (issuecodesByPublicationcode.value[publicationcode] ?? []).map(
        (issuecode) =>
          ({
            id: 0,
            edgeId: publishedEdgesByPublicationcode.value?.[publicationcode]
              ?.map((e) => e.issuecode)
              .includes(issuecode)
              ? 1
              : 0,
            publicationcode,
            issuecode,
            creationDate: new Date(),
            sprites: [],
            points: 0,
            slug: "",
            timestamp: new Date().getTime(),
          }) as const,
      ),
    )
    .groupBy("publicationcode", "[]"),
);

const expandPublication = async (publicationcode: string) => {
  if (showEdgesForPublication.value.includes(publicationcode)) return;
  const issuecodes = (
    issuecodesByPublicationcode.value[publicationcode] ?? []
  ).filter(isValidCode);
  await fetchIssuecodeDetails(issuecodes);
  showEdgesForPublication.value.push(publicationcode);
};

const hasData = computed(() => {
  if (!mostWantedItems.value.length || !publishedEdges.data.value?.length)
    return false;

  const publicationcodes = publicationcodesToFetch.value.filter(isValidCode);
  const hasPubNames =
    !publicationcodes.length ||
    publicationcodes.every((pc) => publicationNames.value[pc]);

  const secondSectionReady =
    !publishedPublicationcodes.value.length ||
    (publishedEdgesByPublicationcode.value &&
      issuesByIssuecode.value &&
      Object.keys(inducksIssuenumbers.value).length);

  return hasPubNames && secondSectionReady;
});
</script>

<style scoped lang="scss">
.publication {
  margin-top: 20px;
}

.bi-eye-fill {
  cursor: pointer;
}

.num {
  width: 4px;
  cursor: default;
  background-color: red;
  opacity: 0.5;

  &.available {
    cursor: pointer;
  }

  &.owned {
    opacity: 1;
  }
}

.available {
  background-color: green !important;
}

.bordered {
  border-right: 1px solid black;
}
</style>
