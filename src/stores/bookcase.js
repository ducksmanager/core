import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

import { collection } from "./collection";

export const bookcase = defineStore("bookcase", {
  state: () => ({
    bookcaseApi: null,

    loadedSprites: {},

    isPrivateBookcase: false,
    isUserNotExisting: false,
    bookcaseUsername: null,
    bookcase: null,
    bookcaseOptions: null,
    bookcaseOrder: null,

    edgeIndexToLoad: 0,
  }),

  getters: {
    isSharedBookcase: ({ bookcaseUsername }) =>
      localStorage.getItem("username") !== bookcaseUsername,

    bookcaseWithPopularities: ({ bookcase, isSharedBookcase }) =>
      (isSharedBookcase ? true : collection().popularIssuesInCollection) &&
      bookcase?.map((issue) => {
        const publicationCode = `${issue.countryCode}/${issue.magazineCode}`;
        const issueCode = `${publicationCode} ${issue.issueNumber}`;
        return {
          ...issue,
          publicationCode,
          issueCode,
          popularity: isSharedBookcase
            ? null
            : collection().popularIssuesInCollection[issueCode] || 0,
        };
      }),
  },

  actions: {
    initApi() {
      const baseURL = import.meta.env.VITE_GATEWAY_URL;
      this.bookcaseApi = axios.create({
        baseURL,
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
    },
    addLoadedSprite({ spritePath, css }) {
      this.loadedSprites = {
        ...this.loadedSprites,
        [spritePath]: css,
      };
    },
    setBookcaseOrder(bookcaseOrder) {
      this.bookcaseOrder = bookcaseOrder;
    },
    setBookcaseUsername(bookcaseUsername) {
      this.bookcaseUsername = bookcaseUsername;
    },

    async loadBookcase() {
      if (!this.bookcase) {
        try {
          this.bookcase = (
            await this.bookcaseApi.get(`/bookcase/${this.bookcaseUsername}`)
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
          await this.bookcaseApi.get(
            `/bookcase/${this.bookcaseUsername}/options`
          )
        ).data;
      }
    },
    async updateBookcaseOptions() {
      await this.bookcaseApi.post(`/bookcase/options`, this.bookcaseOptions);
    },

    async loadBookcaseOrder() {
      if (!this.bookcaseOrder) {
        this.bookcaseOrder = (
          await this.bookcaseApi.get(`/bookcase/${this.bookcaseUsername}/sort`)
        ).data;
      }
    },
    async updateBookcaseOrder() {
      await this.bookcaseApi.post(`/bookcase/sort`, {
        sorts: this.bookcaseOrder,
      });
    },
  },
});
