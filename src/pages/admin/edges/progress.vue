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
        :src="`/images/flags/${
          mostWantedIssue.publicationcode.split('/')[0]
        }.png`"
      />
      {{ publicationNames[mostWantedIssue.publicationcode] }} n°{{
        mostWantedIssue.issuenumber
      }}
    </div>
    <div
      v-if="
        publishedEdges &&
        inducksIssueNumbersNoSpace &&
        Object.keys(inducksIssueNumbersNoSpace).length
      "
    >
      <div
        v-for="(issuenumbers, publicationcode) in publishedEdges"
        :key="publicationcode"
        class="publication"
      >
        <b-icon-eye-fill
          v-if="!showEdgesForPublication.includes(publicationcode as string)"
          @click="showEdgesForPublication.push(publicationcode as string)"
        />
        <b-icon-eye-slash-fill
          v-else
          @click="
            showEdgesForPublication.splice(
              showEdgesForPublication.indexOf(publicationcode as string),
              1
            )
          "
        />
        <Publication
          :publicationcode="publicationcode"
          :publicationname="publicationNames[publicationcode]"
        />
        <div v-if="inducksIssueNumbersNoSpace[publicationcode]">
          <Bookcase
            v-if="showEdgesForPublication.includes(publicationcode as string)"
            :bookcase-textures="bookcaseTextures"
            :sorted-bookcase="
              (inducksIssueNumbersNoSpace[publicationcode] as string[]).map(
                (issuenumber: string) => ({
                  id: `${(publicationcode as string).replace('/', '-')} ${issuenumber}`,
                  edgeId: (issuenumbers as string[])!.includes(issuenumber as string) ? 1 : null,
                  publicationcode,
                  issuenumber,
                })
              )
            "
          />
          <span
            v-for="inducksIssueNumber in inducksIssueNumbersNoSpace[
              publicationcode
            ]"
            v-else
            :key="`${publicationcode as string}-${inducksIssueNumber}`"
          >
            <span
              v-if="!(issuenumbers as string[])?.includes(inducksIssueNumber as string)"
              class="num bordered"
              :title="(inducksIssueNumber as string)"
              >&nbsp;</span
            >
            <span
              v-else-if="!show"
              class="num bordered available"
              :title="(inducksIssueNumber as string)"
              @click="open(publicationcode as string, inducksIssueNumber as string)"
              >&nbsp;</span
            >
            <img
              v-else
              :src="getEdgeUrl(publicationcode as string, inducksIssueNumber as string)"
            />
          </span>
        </div>
        <div v-else>
          Certaines tranches de cette publication sont prêtes mais la
          publication n'existe plus sur Inducks :
          {{ (issuenumbers as string[])!.join(", ") }}
        </div>
      </div>
      <br /><br />
      <b
        >{{
          Object.keys(publishedEdges).reduce(
            (acc, publicationcode) =>
              acc + publishedEdges![publicationcode].length,
            0
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
import { BIconEyeFill, BIconEyeSlashFill } from "bootstrap-icons-vue";
import { onMounted } from "vue";

import { coa } from "~/stores/coa";
import { WantedEdge } from "~types/WantedEdge";

let hasData = $ref(false as boolean);
const show = $ref(false as boolean);
let mostWanted = $ref(null as WantedEdge[] | null);
let publishedEdges = $ref(
  null as { [publicationcode: string]: string[] } | null
);
const showEdgesForPublication = $ref([] as string[]);
const bookcaseTextures = $ref({
  bookcase: "bois/HONDURAS MAHOGANY",
  bookshelf: "bois/KNOTTY PINE",
});

const publicationNames = $computed(() => coa().publicationNames);
const fetchPublicationNames = coa().fetchPublicationNames;
const fetchIssueNumbers = coa().fetchIssueNumbers;
const getEdgeUrl = (publicationcode: string, issuenumber: string) => {
  const [country, magazine] = publicationcode.split("/");
  return `https://edges.ducksmanager.net/edges/${country}/gen/${magazine}.${issuenumber}.png`;
};
const open = (publicationcode: string, issuenumber: string) => {
  window.open(getEdgeUrl(publicationcode, issuenumber), "_blank");
};
const issueNumbers = $computed(() => coa().issueNumbers);
const inducksIssueNumbersNoSpace = $computed(() =>
  Object.keys(issueNumbers).reduce(
    (acc, publicationcode) => ({
      ...acc,
      [publicationcode]: Object.values(issueNumbers[publicationcode]).map(
        (issuenumber) => issuenumber.replace(/ /g, "")
      ),
    }),
    {} as { [publicationcode: string]: string[] }
  )
);

onMounted(async () => {
  mostWanted = (
    (await axios.get("/edges/wanted/data")).data as WantedEdge[]
  ).map((mostWantedIssue) => ({
    ...mostWantedIssue,
    country: mostWantedIssue.publicationcode.split("/")[0],
    magazine: mostWantedIssue.publicationcode.split("/")[1],
  }));

  publishedEdges = (
    (await axios.get("/edges/published/data")).data as {
      publicationcode: string;
      issuenumber: string;
    }[]
  ).reduce(
    (acc, { publicationcode, issuenumber }) => ({
      ...acc,
      [publicationcode]: [...(acc[publicationcode] || []), issuenumber],
    }),
    {} as { [publicationcode: string]: string[] }
  );

  await fetchPublicationNames([
    ...mostWanted.map((mostWantedIssue) => mostWantedIssue.publicationcode),
    ...Object.keys(publishedEdges),
  ]);

  await fetchIssueNumbers(Object.keys(publishedEdges));
  hasData = true;
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

  &.available {
    cursor: pointer;
  }
}

.available {
  background-color: green !important;
}

.bordered {
  border-right: 1px solid black;
}
</style>
