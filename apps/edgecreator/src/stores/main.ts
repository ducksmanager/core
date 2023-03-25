import { AxiosInstance } from "axios";
import { EdgeWithModelId } from "ducksmanager/types/EdgeWithModelId";
import { defineStore } from "pinia";

import { api } from "~/stores/api";
import { call } from "~/util/axios";
import { GET__fs__browse__$imageType__$country__$magazine } from "~types/routes";
import { SimpleUser } from "~types/SimpleUser";

import { coa } from "./coa";

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});
export const main = defineStore("main", {
  state: () => ({
    country: null as string | null,
    magazine: null as string | null,
    issuenumbers: [] as string[],
    isRange: false as boolean,
    photoUrls: {} as { [issuenumber: string]: string },
    contributors: {} as {
      [issuenumber: string]: {
        designers: SimpleUser[];
        photographers: SimpleUser[];
      };
    },

    edgesBefore: [] as EdgeWithModelId[],
    edgesAfter: [] as EdgeWithModelId[],

    publicationElements: [] as string[],
    publicationPhotos: [] as string[],

    warnings: [] as string[],
  }),

  getters: {
    publicationcode(): string {
      return `${this.country}/${this.magazine}`;
    },

    publicationIssues(): string[] {
      return coa().issueNumbers[this.publicationcode] || [];
    },

    publicationElementsForGallery: ({ country, publicationElements }) =>
      publicationElements &&
      publicationElements.map((elementFileName) => ({
        name: elementFileName,
        url: `/edges/${country}/elements/${elementFileName}`,
      })),

    publicationPhotosForGallery: ({ country, publicationPhotos }) =>
      publicationPhotos &&
      publicationPhotos.map((elementFileName) => ({
        name: elementFileName,
        url: `/edges/${country}/photos/${elementFileName}`,
      })),
  },

  actions: {
    addContributor({
      issuenumber,
      contributionType,
      user,
    }: {
      issuenumber: string;
      contributionType: "photographers" | "designers";
      user: SimpleUser;
    }) {
      const contributors = this.contributors[issuenumber] || {
        designers: [],
        photographers: [],
      };
      this.contributors[issuenumber] = {
        ...contributors,
        [contributionType]: [
          ...new Set([...contributors[contributionType], user]),
        ],
      };
    },
    removeContributor({
      contributionType,
      userToRemove,
    }: {
      contributionType: "photographers" | "designers";
      userToRemove: SimpleUser;
    }) {
      Object.keys(this.contributors).forEach((issuenumber) => {
        const issueContributors = this.contributors[issuenumber];
        const index = issueContributors[contributionType].findIndex(
          (user) => user === userToRemove
        );
        issueContributors[contributionType].splice(index, 1);
        this.contributors[issuenumber] = issueContributors;
      });
    },
    addWarning(warning: string) {
      this.warnings = [...this.warnings, warning];
    },
    removeWarning(idx: number) {
      this.warnings.splice(idx, 1);
    },

    setIssuenumbers({
      min,
      max,
      others,
    }: {
      min: string;
      max?: string;
      others?: string;
    }) {
      const firstIssueIndex = this.publicationIssues.findIndex(
        (issue) => issue === min
      );
      if (firstIssueIndex === -1) {
        throw new Error(`Issue ${min} doesn't exist`);
      }
      if (max === undefined) {
        this.issuenumbers = [min, ...(others ? others.split(",") : [])];
      } else {
        this.isRange = true;
        let lastIssueIndex = this.publicationIssues.findIndex(
          (issue) => issue === max
        );
        if (lastIssueIndex === -1) {
          lastIssueIndex = this.publicationIssues.length - 1;
          console.warn(
            `Issue ${max} doesn't exist, falling back to ${this.publicationIssues[lastIssueIndex]}`
          );
        }

        this.issuenumbers = this.publicationIssues.filter(
          (_, index) => index >= firstIssueIndex && index <= lastIssueIndex
        );
      }
    },
    async loadItems({ itemType }: { itemType: "elements" | "photos" }) {
      const [country, magazine] = this.publicationcode.split("/");
      const items = (
        await call(
          api().edgeCreatorApi,
          new GET__fs__browse__$imageType__$country__$magazine({
            params: { imageType: itemType, country, magazine },
          })
        )
      ).data.sort(numericSortCollator.compare);
      if (itemType === "elements") {
        this.publicationElements = items;
      } else {
        this.publicationPhotos = items;
      }
    },
    async loadPublicationIssues() {
      return coa().fetchIssueNumbers([this.publicationcode]);
    },
    async loadSurroundingEdges() {
      const firstIssueIndex = this.publicationIssues.findIndex(
        (issue) => issue === this.issuenumbers[0]
      );
      const lastIssueIndex = this.publicationIssues.findIndex(
        (issue) => issue === this.issuenumbers[this.issuenumbers.length - 1]
      );
      const issuesBefore = this.publicationIssues.filter(
        (_, index) =>
          firstIssueIndex !== -1 &&
          index >= firstIssueIndex - 10 &&
          index < firstIssueIndex
      );
      const issuesAfter = this.publicationIssues.filter(
        (_, index) =>
          lastIssueIndex !== -1 &&
          index > lastIssueIndex &&
          index <= lastIssueIndex + 10
      );

      const getEdgePublicationStates = async (
        edges: string[]
      ): Promise<EdgeWithModelId[]> =>
        Object.values(
          (
            await call(
              api().dmApi,
              new GET__edges__$countrycode__$magazinecode__$issuenumbers({
                params: {
                  countrycode: this.publicationcode.split("/")[0],
                  magazinecode: this.publicationcode.split("/")[1],
                  issuenumbers: edges.join(","),
                },
              })
            )
          ).data
        ).sort(
          (
            { issuenumber: issuenumber1 }: { issuenumber: string },
            { issuenumber: issuenumber2 }: { issuenumber: string }
          ) =>
            Math.sign(edges.indexOf(issuenumber1) - edges.indexOf(issuenumber2))
        );

      if (issuesBefore.length) {
        this.edgesBefore = await getEdgePublicationStates(issuesBefore);
      }

      if (issuesAfter.length) {
        this.edgesAfter = await getEdgePublicationStates(issuesAfter);
      }
    },

    getChunkedRequests: async ({
      api,
      url,
      parametersToChunk,
      chunkSize,
      suffix = "",
    }: {
      api: AxiosInstance;
      url: string;
      parametersToChunk: (string | number)[];
      chunkSize: number;
      suffix?: string;
    }) =>
      await Promise.all(
        await Array.from(
          { length: Math.ceil(parametersToChunk.length / chunkSize) },
          (_, i) =>
            parametersToChunk.slice(i * chunkSize, i * chunkSize + chunkSize)
        ).reduce(
          async (acc, codeChunk) =>
            (
              await acc
            ).concat(await api.get(`${url}${codeChunk.join(",")}${suffix}`)),
          Promise.resolve([])
        )
      ),
  },
});
