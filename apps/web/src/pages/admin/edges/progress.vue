<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <div v-if="hasData">
    <div
      v-for="mostWantedIssue in mostWanted"
      :key="`wanted-${mostWantedIssue.issuecode?.replace(/[^\w]/g, '-')}`"
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
          getImagePath(
            `flags/${mostWantedIssue.publicationcode.split('/')[0]}.png`,
          )
        "
      />
      n°{{
        mostWantedIssue.issuecode
      }}
    </div>
    <div
      v-if="
        publishedEdgesIssuecodes &&
        issuesByIssueCode &&
        issueNumbersByPublicationcodeAndIssuecode &&
        Object.keys(issueNumbersByPublicationcodeAndIssuecode).length
      "
    >
      <div
        v-for="publicationcode of publishedEdgesPublicationcodes"
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
        <div v-if="issueNumbersByPublicationcodeAndIssuecode[publicationcode]">
          <Bookcase
            v-if="showEdgesForPublication.includes(publicationcode)"
            :bookcase-textures="bookcaseTextures"
            :sorted-bookcase="sortedBookcase[publicationcode]"
          />
          <span
            v-for="issuecode of Object.keys(
              issueNumbersByPublicationcodeAndIssuecode[publicationcode],
            )"
            v-else
            :key="`${publicationcode}-${issuecode}`"
          > 
            <span
              class="num bordered"
              :class="{
                available: publishedEdgesIssuecodes?.has(issuecode),
                owned: issuecode in issuesByIssueCode,
              }"
              :title="issueNumbersByPublicationcodeAndIssuecode[publicationcode][issuecode]"
              @click="open(issuecode, publicationcode, issueNumbersByPublicationcodeAndIssuecode[publicationcode][issuecode])"
              >&nbsp;</span
            >
          </span>
        </div>
        <div v-else>
          Certaines tranches de cette publication sont prêtes mais la
          publication n'existe plus sur Inducks :
          {{ Object.keys(issueNumbersByPublicationcodeAndIssuecode[publicationcode]).join(", ") }}
        </div>
      </div>
      <br /><br />
      <b
        >{{
          Object.keys(publishedEdgesIssuecodes).reduce(
            (acc, publicationcode) =>
              acc + Array.from(publishedEdgesIssuecodes).filter(issuecode => issuecode.startsWith(publicationcode)).length,
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
import axios from "axios";

import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";
import { call } from "~axios-helper";
import { WantedEdge } from "~dm-types/WantedEdge";
const { getImagePath } = images();

let hasData = $ref(false as boolean);
let mostWanted = $ref(null as WantedEdge[] | null);
let publishedEdgesPublicationcodes = $ref(new Set<string>());
let publishedEdgesIssuecodes = $ref(new Set<string>());
const showEdgesForPublication = $ref([] as string[]);
const bookcaseTextures = $ref({
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
});

const { fetchPublicationNames, fetchIssueNumbers } = coa();
const { publicationNames, issueNumbersByPublicationcodeAndIssuecode } =
  storeToRefs(coa());

const { loadCollection } = collection();
const { issuesByIssueCode } = storeToRefs(collection());

const getEdgeUrl = (publicationcode: string, issuenumber: string): string => {
  const [country, magazine] = publicationcode.split("/");
  return `${
    import.meta.env.VITE_EDGES_ROOT
  }/${country}/gen/${magazine}.${issuenumber}.png`;
};
const open = (
  issuecode: string,
  publicationcode: string,
  issuenumber: string,
) => {
  if (publishedEdgesIssuecodes.has(issuecode)) {
    window.open(getEdgeUrl(publicationcode, issuenumber), "_blank");
  }
};

const sortedBookcase = computed(() =>
  Object.values(showEdgesForPublication).reduce<
    Record<string, BookcaseEdgeWithPopularity[]>
  >(
    (acc, publicationcode) => ({
      ...acc,
      [publicationcode]:
        Object.keys(
          issueNumbersByPublicationcodeAndIssuecode.value[publicationcode],
        ).map((issuecode) => {
          const issuenumber =
            issueNumbersByPublicationcodeAndIssuecode.value[publicationcode][
              issuecode
            ];
          return {
            id: 0,
            issueCode: issuecode,
            edgeId: publishedEdgesIssuecodes.has(issuecode) ? 1 : 0,
            publicationcode,
            countryCode: publicationcode.split("/")[0],
            magazineCode: publicationcode.split("/")[1],
            issuenumber,
            issuenumberReference: issuenumber,
            creationDate: new Date(),
            sprites: [],
          };
        }) || [],
    }),
    {},
  ),
);

(async () => {
  mostWanted = (await call(axios, new GET__edges__wanted__data())).data.filter(mostWantedIssue => mostWantedIssue.issuecode)

  const publishedEdges = (await call(axios, new GET__edges__published__data()))
    .data;

  for (const { publicationcode, issuecode } of publishedEdges) {
    publishedEdgesPublicationcodes.add(publicationcode);
    publishedEdgesIssuecodes.add(issuecode!);
  }
  debugger

  await fetchPublicationNames([
    ...mostWanted.map((mostWantedIssue) => mostWantedIssue.publicationcode),
    ...publishedEdgesPublicationcodes,
  ]);

  await fetchIssueNumbers(Array.from(publishedEdgesPublicationcodes));
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
