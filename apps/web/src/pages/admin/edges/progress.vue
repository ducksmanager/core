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
import type { BookcaseEdgeWithPopularity } from "~/stores/bookcase";

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
  Object.keys(issuecodesByPublicationcode.value).reduce<
    Record<string, string[]>
  >((acc, publicationcode) => {
    acc[publicationcode] = Object.values(
      issuecodesByPublicationcode.value[publicationcode],
    )
      .filter((issuecode) => issuecode in issuecodeDetails.value)
      .map((issuecode) =>
        issuecodeDetails.value[issuecode].issuenumber.replaceAll(" ", ""),
      );
    return acc;
  }, {}),
);

const sortedBookcase = computed(() =>
  Object.values(showEdgesForPublication).reduce<
    Record<string, BookcaseEdgeWithPopularity[]>
  >((acc, publicationcode) => {
    acc[publicationcode] =
      issuecodesByPublicationcode.value[publicationcode]?.map((issuecode) => ({
        id: 0,
        edgeId: publishedEdgesByPublicationcode.value?.[publicationcode]
          .map(({ issuecode }) => issuecode)
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
      })) || [];
    return acc;
  }, {}),
);

const isValidCode = (code: string | undefined): code is string =>
  Boolean(code && code !== "undefined");

const expandPublication = async (publicationcode: string) => {
  if (showEdgesForPublication.value.includes(publicationcode)) return;
  const issuecodes = (
    issuecodesByPublicationcode.value[publicationcode] ?? []
  ).filter(isValidCode);
  await fetchIssuecodeDetails(issuecodes);
  showEdgesForPublication.value.push(publicationcode);
};

const hasData = computed(() => {
  const mostWantedItemsData = mostWantedItems.value;
  const publishedEdgesItems = publishedEdges.data.value ?? [];

  if (!mostWantedItemsData.length && !publishedEdgesItems.length) return false;

  const mostWantedPublicationcodes = mostWantedItemsData
    .map((m) => m.publicationcode)
    .filter(isValidCode);
  const publishedPublicationcodes = Object.keys(
    publishedEdgesItems.groupBy?.("publicationcode") ?? {},
  ).filter(isValidCode);
  const allPublicationcodes = [
    ...new Set([...mostWantedPublicationcodes, ...publishedPublicationcodes]),
  ];

  const hasPublicationNames =
    allPublicationcodes.every((pc) => publicationNames.value[pc]) ||
    !allPublicationcodes.length;
  const hasIssuecodes =
    !publishedPublicationcodes.length ||
    publishedPublicationcodes.every(
      (pc) => issuecodesByPublicationcode.value[pc],
    );

  const issuecodes = Object.keys(
    publishedEdgesItems.groupBy?.("issuecode") ?? {},
  ).filter(isValidCode);
  const hasIssuecodeDetails =
    !issuecodes.length ||
    issuecodes.every((ic) => ic in issuecodeDetails.value);

  const hasCollection =
    !publishedPublicationcodes.length || !!issuesByIssuecode.value;

  const inducksKeys = Object.keys(inducksIssuenumbers.value);
  const hasInducksIssuenumbers =
    !publishedPublicationcodes.length || inducksKeys.length;

  return (
    hasPublicationNames &&
    hasIssuecodes &&
    hasIssuecodeDetails &&
    hasCollection &&
    hasInducksIssuenumbers
  );
});

watchEffect(async () => {
  if (
    mostWanted.asyncStatus.value !== "idle" ||
    publishedEdges.asyncStatus.value !== "idle" ||
    !mostWanted.data ||
    !publishedEdges.data
  ) {
    return;
  }

  const mostWantedItems = mostWanted.data.value ?? [];
  const publishedEdgesItems = publishedEdges.data.value ?? [];
  const publicationcodes = Object.keys(
    publishedEdgesItems.groupBy("publicationcode"),
  ).filter(isValidCode);

  const publicationcodesToFetch = [
    ...mostWantedItems
      .map((mostWantedIssue) => mostWantedIssue.publicationcode)
      .filter(isValidCode),
    ...publicationcodes,
  ];

  await fetchPublicationNames(publicationcodesToFetch);

  await fetchIssuecodesByPublicationcode(publicationcodes);
  await fetchIssuecodeDetails(
    Object.keys(publishedEdgesItems.groupBy("issuecode")).filter(isValidCode),
  );
  await loadCollection();
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
