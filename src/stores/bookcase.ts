import axios from "axios";
import { defineStore } from "pinia";

import { collection } from "./collection";

interface BookcaseEdge {
  id: number;
  countryCode: string;
  magazineCode: string;
  issueNumber: string;
  issueNumberReference: string;
  edgeId: number;
  creationDate: Date;
  sprites: string;
}

export const bookcase = defineStore("bookcase", {
  state: () => ({
    loadedSprites: {},

    isPrivateBookcase: false as boolean,
    isUserNotExisting: false as boolean,
    bookcaseUsername: null as string | null,
    bookcase: null as BookcaseEdge[] | null,
    bookcaseOptions: null,
    bookcaseOrder: null,

    edgeIndexToLoad: 0 as number,
  }),

  getters: {
    isSharedBookcase: ({ bookcaseUsername }): boolean =>
      collection().user?.username !== bookcaseUsername,

    bookcaseWithPopularities({ bookcase }) {
      return (
        (this.isSharedBookcase
          ? true
          : collection().popularIssuesInCollection) &&
        bookcase?.map((issue) => {
          const publicationCode = `${issue.countryCode}/${issue.magazineCode}`;
          const issueCode = `${publicationCode} ${issue.issueNumber}`;
          return {
            ...issue,
            publicationCode,
            issueCode,
            popularity: this.isSharedBookcase
              ? null
              : collection().popularIssuesInCollection[issueCode] || 0,
          };
        })
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
          switch (e.response.status) {
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
