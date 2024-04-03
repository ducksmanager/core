<route lang="yaml">
meta:
  layout: bare
</route>

<template>
  <div v-if="hasData">
    <div
      v-for="mostWantedIssue in mostWanted"
      :key="`wanted-${mostWantedIssue.publicationcode}-${mostWantedIssue.issuenumber}`"
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
      {{ publicationNames[mostWantedIssue.publicationcode] }} n°{{
        mostWantedIssue.issuenumber
      }}
    </div>
    <div
      v-if="
        publishedEdges &&
        issuesByIssueCode &&
        inducksIssueNumbersNoSpace &&
        Object.keys(inducksIssueNumbersNoSpace).length
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
        <div v-if="inducksIssueNumbersNoSpace[publicationcode]">
          <Bookcase
            v-if="showEdgesForPublication.includes(publicationcode)"
            :bookcase-textures="bookcaseTextures"
            :sorted-bookcase="sortedBookcase[publicationcode]"
          />
          <span
            v-for="inducksIssueNumber in inducksIssueNumbersNoSpace[
              publicationcode
            ]"
            v-else
            :key="`${publicationcode}-${inducksIssueNumber}`"
          >
            <span
              class="num bordered"
              :class="{
                available: issuenumbers?.includes(inducksIssueNumber),
                owned:
                  issuesByIssueCode[
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
import { BookcaseEdgeWithPopularity } from "~/stores/bookcase";
import { WantedEdge } from "~dm-types/WantedEdge";

const { getImagePath } = images();

let hasData = $ref(false as boolean);
let mostWanted = $ref(null as WantedEdge[] | null);
let publishedEdges = $ref({} as Record<string, string[]>);
const showEdgesForPublication = $ref([] as string[]);
const bookcaseTextures = $ref({
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
});

const {
  edges: { services: edgesServices },
} = injectLocal("dmSocket") as ReturnType<typeof useDmSocket>;

const { fetchPublicationNames, fetchIssueNumbers } = coa();
const { publicationNames, issueNumbers } = storeToRefs(coa());

const { loadCollection } = collection();
const { issuesByIssueCode } = storeToRefs(collection());

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
const inducksIssueNumbersNoSpace = $computed(() =>
  Object.keys(issueNumbers).reduce<Record<string, string[]>>(
    (acc, publicationcode) => ({
      ...acc,
      [publicationcode]: Object.values(issueNumbers.value[publicationcode]).map(
        (issuenumber) => issuenumber.replace(/ /g, ""),
      ),
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
        inducksIssueNumbersNoSpace[publicationcode]?.map((issuenumber) => ({
          id: 0,
          issueCode: `${publicationcode}-${issuenumber}`,
          edgeId: publishedEdges?.[publicationcode].includes(issuenumber)
            ? 1
            : 0,
          publicationcode,
          countryCode: publicationcode.split("/")[0],
          magazineCode: publicationcode.split("/")[1],
          issuenumber,
          issuenumberReference: issuenumber,
          creationDate: new Date(),
          sprites: [],
        })) || [],
    }),
    {},
  ),
);

(async () => {
  mostWanted = (await edgesServices.getWantedEdges()).map(
    (mostWantedIssue) => ({
      ...mostWantedIssue,
      country: mostWantedIssue.publicationcode.split("/")[0],
      magazine: mostWantedIssue.publicationcode.split("/")[1],
    }),
  );

  publishedEdges = (await edgesServices.getPublishedEdges()).reduce(
    (acc, { publicationcode, issuenumber }) => ({
      ...acc,
      [publicationcode]: [...(acc[publicationcode] || []), issuenumber],
    }),
    {} as Record<string, string[]>,
  );

  await fetchPublicationNames([
    ...mostWanted.map((mostWantedIssue) => mostWantedIssue.publicationcode),
    ...Object.keys(publishedEdges),
  ]);

  await fetchIssueNumbers(Object.keys(publishedEdges));
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
