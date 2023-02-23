import axios, { AxiosError } from "axios";
import { defineStore } from "pinia";

import { call } from "~/util/axios";
import { BookcaseEdge } from "~types/BookcaseEdge";
import {
  GET__bookcase__$username,
  GET__bookcase__$username__options,
  GET__bookcase__$username__sort,
  POST__bookcase__options,
  POST__bookcase__sort,
} from "~types/routes";

import { collection } from "./collection";

export interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  publicationcode: string;
  issueCode: string;
  popularity: number;
}

export const bookcase = defineStore("bookcase", {
  state: () => ({
    loadedSprites: {} as { [key: string]: string },

    isPrivateBookcase: false as boolean,
    isUserNotExisting: false as boolean,
    bookcaseUsername: null as string | null,
    bookcase: null as BookcaseEdge[] | null,
    bookcaseOptions: null as
      | GET__bookcase__$username__options["resBody"]
      | null,
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
                ? 0
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
            await call<GET__bookcase__$username>(axios, {
              params: { username: this.bookcaseUsername! },
            })
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
          await call<GET__bookcase__$username__options>(axios, {
            params: { username: this.bookcaseUsername! },
          })
        ).data;
      }
    },
    async updateBookcaseOptions() {
      await call<POST__bookcase__options>(axios, {
        reqBody: this.bookcaseOptions!,
      });
    },

    async loadBookcaseOrder() {
      if (!this.bookcaseOrder) {
        this.bookcaseOrder = (
          await call<GET__bookcase__$username__sort>(axios, {
            params: { username: this.bookcaseUsername! },
          })
        ).data;
      }
    },
    async updateBookcaseOrder() {
      await call<POST__bookcase__sort>(axios, {
        reqBody: { sorts: this.bookcaseOrder as string[] },
      });
    },
  },
});
