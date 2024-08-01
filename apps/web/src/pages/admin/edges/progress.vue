<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <div v-if="hasData">
    <div
      v-for="mostWantedIssue in mostWanted"
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
        publishedEdges &&
        issuesByIssuecode &&
        inducksIssuenumbers &&
        Object.keys(inducksIssuenumbers).length
      "
    >
      <div
        v-for="[publicationcode, issuenumbers] in Object.entries(
          publishedEdges,
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
          @click="showEdgesForPublication.push(publicationcode)"
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
          :publicationname="
            publicationNames[publicationcode] || publicationcode
          "
        />
        <div v-if="inducksIssuenumbers[publicationcode]">
          <Bookcase
            v-if="showEdgesForPublication.includes(publicationcode)"
            :bookcase-textures="bookcaseTextures"
            :sorted-bookcase="sortedBookcase[publicationcode]"
          />
          <span
            v-for="inducksIssueNumber in inducksIssuenumbers[publicationcode]"
            v-else
            :key="`${publicationcode}-${inducksIssueNumber}`"
          >
            <span
              class="num bordered"
              :class="{
                available: issuenumbers?.includes(inducksIssueNumber),
                owned:
                  issuesByIssuecode[
                    `${publicationcode} ${inducksIssueNumber}`
                  ]!!,
              }"
              :title="inducksIssueNumber"
              @click="open(publicationcode, inducksIssueNumber)"
              >&nbsp;</span
            >
          </span>
        </div>
        <div v-else>
          Certaines tranches de cette publication sont prêtes mais la
          publication n'existe plus sur Inducks :
          {{ issuenumbers.join(", ") }}
        </div>
      </div>
      <br /><br />
      <b
        >{{
          Object.keys(publishedEdges).reduce(
            (acc, publicationcode) =>
              acc + publishedEdges[publicationcode].length,
            0,
          )
        }}
        tranches prêtes.</b
      ><br />
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
import type { BookcaseEdgeWithPopularity } from "~/stores/bookcase";
import type { WantedEdge } from "~dm-types/WantedEdge";

import { dmSocketInjectionKey } from "../../../composables/useDmSocket";

const { getImagePath } = images();

let hasData = $ref(false);
let mostWanted = $shallowRef<WantedEdge[] | null>(null);
let publishedEdges = $ref<Record<string, string[]>>({});
const showEdgesForPublication = $ref<string[]>([]);
const bookcaseTextures = $ref({
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
});

const {
  edges: { services: edgesServices },
} = injectLocal(dmSocketInjectionKey)!;

const { fetchPublicationNames, fetchIssuecodesByPublicationcode } = coa();
const { publicationNames, issuecodesByPublicationcode } = storeToRefs(coa());

const { loadCollection } = collection();
const { issuesByIssuecode } = storeToRefs(collection());

const getEdgeUrl = (publicationcode: string, issuenumber: string): string => {
  const [country, magazine] = publicationcode.split("/");
  return `${
    import.meta.env.VITE_EDGES_ROOT
  }/${country}/gen/${magazine}.${issuenumber}.png`;
};
const open = (publicationcode: string, issuenumber: string) => {
  if (publishedEdges[publicationcode].includes(issuenumber)) {
    window.open(getEdgeUrl(publicationcode, issuenumber), "_blank");
  }
};
const inducksIssuenumbers = $computed(() =>
  Object.keys(issuecodesByPublicationcode.value).reduce<
    Record<string, string[]>
  >(
    (acc, publicationcode) => ({
      ...acc,
      [publicationcode]: Object.values(
        issuecodesByPublicationcode.value[publicationcode],
      ).map((issuenumber) => issuenumber.replace(/ /g, "")),
    }),
    {},
  ),
);

const sortedBookcase = computed(() =>
  Object.values(showEdgesForPublication).reduce<
    Record<string, BookcaseEdgeWithPopularity[]>
  >(
    (acc, publicationcode) => ({
      ...acc,
      [publicationcode]:
        issuecodesByPublicationcode.value[publicationcode]?.map(
          (issuecode) => ({
            id: 0,
            edgeId: publishedEdges?.[publicationcode].includes(issuecode)
              ? 1
              : 0,
            publicationcode,
            issuecode,
            creationDate: new Date(),
            sprites: [],
            points: 0,
            slug: "",
            timestamp: new Date().getTime(),
          }),
        ) || [],
    }),
    {},
  ),
);

(async () => {
  mostWanted = await edgesServices.getWantedEdges();

  publishedEdges = (await edgesServices.getPublishedEdges()).reduce<
    Record<string, string[]>
  >(
    (acc, { publicationcode, issuecode }) => ({
      ...acc,
      [publicationcode]: [...(acc[publicationcode] || []), issuecode],
    }),
    {},
  );

  await fetchPublicationNames([
    ...mostWanted.map((mostWantedIssue) => mostWantedIssue.publicationcode),
    ...Object.keys(publishedEdges),
  ]);

  await fetchIssuecodesByPublicationcode(Object.keys(publishedEdges));
  await loadCollection();
  hasData = true;
})();
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
