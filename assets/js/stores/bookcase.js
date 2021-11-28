import Vue from 'vue'
import axios from "axios";
import { defineStore } from "pinia";
import { collection } from "./collection";

export const bookcase = defineStore('bookcase', {
  state: () => ({
    loadedSprites: {},

    isPrivateBookcase: false,
    isUserNotExisting: false,
    bookcaseUsername: null,
    bookcase: null,
    bookcaseOptions: null,
    bookcaseOrder: null,

    edgeIndexToLoad: 0
  }),

  getters: {
    isSharedBookcase: ({ bookcaseUsername }) => localStorage.getItem('username') !== bookcaseUsername,

    bookcaseWithPopularities: ({bookcase, isSharedBookcase}) => (isSharedBookcase ? true : collection().popularIssuesInCollection)
      && bookcase
      && bookcase
        .map((issue) => {
          const publicationCode = `${issue.countryCode}/${issue.magazineCode}`;
          const issueCode = `${publicationCode} ${issue.issueNumber}`;
          return {
            ...issue,
            publicationCode,
            issueCode,
            popularity: isSharedBookcase ? null : collection().popularIssuesInCollection[issueCode] || 0
          };
        })
  },

  actions: {
    addLoadedSprite({spritePath, css}) {
      Vue.set(this.loadedSprites, spritePath, css)
    },
    setBookcaseOrder(bookcaseOrder) {
      this.bookcaseOrder = bookcaseOrder
    },
    setBookcaseUsername(bookcaseUsername) {
      this.bookcaseUsername = bookcaseUsername
    },

    async loadBookcase() {
      if (!this.bookcase) {
        try {
          this.bookcase = (await axios.get(`/api/bookcase/${this.bookcaseUsername}`)).data
        } catch (e) {
          switch (e.response.status) {
            case 403:
              this.isPrivateBookcase = true
              break;
            case 404:
              this.isUserNotExisting = true
              break;
          }
        }
      }
    },
    async loadBookcaseOptions() {
      if (!this.bookcaseOptions) {
        this.bookcaseOptions = (await axios.get(`/api/bookcase/${this.bookcaseUsername}/options`)).data
      }
    },
    async updateBookcaseOptions() {
      await axios.post(`/api/bookcase/options`, this.bookcaseOptions)
    },

    async loadBookcaseOrder() {
      if (!this.bookcaseOrder) {
        this.bookcaseOrder = (await axios.get(`/api/bookcase/${this.bookcaseUsername}/sort`)).data
      }
    },
    async updateBookcaseOrder() {
      await axios.post(`/api/bookcase/sort`, {sorts: this.bookcaseOrder})
    },
  }
})
