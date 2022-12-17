import axios, { AxiosError } from "axios";
import { defineStore } from "pinia";

import { collection } from "./collection";

interface BookcaseEdge {
  id: number;
  countryCode: string;
  magazineCode: string;
  publicationcode: string;
  issuenumber: string;
  issueNumberReference: string;
  edgeId: number;
  creationDate: Date;
  sprites: string;
}

export interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  publicationcode: string;
  issueCode: string;
  popularity: number | null;
}

export const bookcase = defineStore("bookcase", {
  state: () => ({
    loadedSprites: {} as { [key: string]: string },

    isPrivateBookcase: false as boolean,
    isUserNotExisting: false as boolean,
    bookcaseUsername: null as string | null,
    bookcase: null as BookcaseEdge[] | null,
    bookcaseOptions: null as {
      textures: {
        bookcase: string;
        bookshelf: string;
      };
      showAllCopies: boolean;
    } | null,
    bookcaseOrder: null as string[] | null,

    edgeIndexToLoad: 0 as number,
  }),

  getters: {
    isSharedBookcase: ({ bookcaseUsername }): boolean =>
      collection().user?.username !== bookcaseUsername,

    bookcaseWithPopularities(): BookcaseEdgeWithPopularity[] | null {
      const isSharedBookcase = this.isSharedBookcase;
      return (
        ((isSharedBookcase ? true : collection().popularIssuesInCollection) &&
          this.bookcase?.map((issue) => {
            const publicationcode = `${issue.countryCode}/${issue.magazineCode}`;
            const issueCode = `${publicationcode} ${issue.issuenumber}`;
            return {
              ...issue,
              publicationcode,
              issueCode,
              popularity: isSharedBookcase
                ? null
                : collection().popularIssuesInCollection?.[issueCode] || 0,
            };
          })) ||
        null
      );
    },
  },

  actions: {
    addLoadedSprite({ spritePath, css }: { spritePath: string; css: string }) {
      this.loadedSprites = {
        ...this.loadedSprites,
        [spritePath]: css,
      };
    },

    async loadBookcase() {
      if (!this.bookcase) {
        try {
          this.bookcase = (
            await axios.get(`/bookcase/${this.bookcaseUsername}`)
          ).data;
        } catch (e) {
          switch ((e as AxiosError).response?.status) {
            case 403:
              this.isPrivateBookcase = true;
              break;
            case 404:
              this.isUserNotExisting = true;
              break;
          }
        }
      }
    },
    async loadBookcaseOptions() {
      if (!this.bookcaseOptions) {
        this.bookcaseOptions = (
          await axios.get(`/bookcase/${this.bookcaseUsername}/options`)
        ).data;
      }
    },
    async updateBookcaseOptions() {
      await axios.post(`/bookcase/options`, this.bookcaseOptions);
    },

    async loadBookcaseOrder() {
      if (!this.bookcaseOrder) {
        this.bookcaseOrder = (
          await axios.get(`/bookcase/${this.bookcaseUsername}/sort`)
        ).data;
      }
    },
    async updateBookcaseOrder() {
      await axios.post(`/bookcase/sort`, {
        sorts: this.bookcaseOrder,
      });
    },
  },
});
