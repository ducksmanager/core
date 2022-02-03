import { defineStore } from 'pinia'
import { user } from './user'

export const collection = defineStore('collectionEC', {
  state: () => ({
    bookcase: null,
    popularIssuesInCollection: null,
  }),

  getters: {
    isSharedBookcase: () => false,

    bookcaseWithPopularities: ({
      bookcase,
      isSharedBookcase,
      popularIssuesInCollection,
    }) =>
      (isSharedBookcase ? true : popularIssuesInCollection) &&
      bookcase &&
      bookcase.map((issue) => {
        const publicationCode = `${issue.countryCode}/${issue.magazineCode}`
        const issueCode = `${publicationCode} ${issue.issueNumber}`
        return {
          ...issue,
          publicationCode,
          issueCode,
          popularity: isSharedBookcase
            ? null
            : popularIssuesInCollection[issueCode] || 0,
        }
      }),

    popularIssuesInCollectionWithoutEdge: ({ bookcaseWithPopularities }) =>
      bookcaseWithPopularities &&
      bookcaseWithPopularities
        .filter(({ edgeId, popularity }) => !edgeId && popularity > 0)
        .sort(
          ({ popularity: popularity1 }, { popularity: popularity2 }) =>
            popularity2 - popularity1
        ),
  },

  actions: {
    async loadBookcase() {
      this.bookcase = (
        await this.$nuxt.$axios.get(`/api/bookcase/${user().username}`)
      ).data
    },
    async loadPopularIssuesInCollection() {
      if (!this.popularIssuesInCollection) {
        this.popularIssuesInCollection = (
          await this.$nuxt.$axios.get('/api/collection/popular')
        ).data.reduce(
          (acc, issue) => ({
            ...acc,
            [`${issue.country}/${issue.magazine} ${issue.issueNumber}`]:
              issue.popularity,
          }),
          {}
        )
      }
    },
  },
})
