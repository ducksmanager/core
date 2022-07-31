import Vue from 'vue'
import { defineStore } from 'pinia'
import { coa } from './coa'

const numericSortCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})
export const main = defineStore('main', {
  state: () => ({
    country: null,
    magazine: null,
    issuenumbers: [],
    isRange: false,
    photoUrls: {},
    contributors: {},

    edgesBefore: [],
    edgesAfter: [],

    publicationElements: [],
    publicationPhotos: [],

    warnings: [],
  }),

  getters: {
    publicationcode: ({ country, magazine }) => `${country}/${magazine}`,

    publicationIssues: ({ publicationcode }) =>
      coa().issueNumbers[publicationcode] || [],

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
    setPhotoUrl({ issuenumber, filename }) {
      Vue.set(this.photoUrls, issuenumber, filename)
    },
    addContributor({ issuenumber, contributionType, user }) {
      const contributors = this.contributors[issuenumber] || {
        designers: [],
        photographers: [],
      }
      Vue.set(this.contributors, issuenumber, {
        ...contributors,
        [contributionType]: [
          ...new Set([...contributors[contributionType], user]),
        ],
      })
    },
    removeContributor({ contributionType, userToRemove }) {
      Object.keys(this.contributors).forEach((issuenumber) => {
        const issueContributors = this.contributors[issuenumber]
        const index = issueContributors[contributionType].findIndex((user) => {
          return user === userToRemove
        })
        issueContributors[contributionType].splice(index, 1)
        Vue.set(this.contributors, issuenumber, issueContributors)
      })
    },
    addWarning(warning) {
      this.warnings = [...this.warnings, warning]
    },
    removeWarning(idx) {
      this.warnings.splice(idx, 1)
    },

    setIssuenumbers({ min, max, others }) {
      const firstIssueIndex = this.publicationIssues.findIndex(
        (issue) => issue === min
      )
      if (firstIssueIndex === -1) {
        throw new Error(`Issue ${min} doesn't exist`)
      }
      if (max === undefined) {
        this.issuenumbers = [min, ...(others ? others.split(',') : [])]
      } else {
        this.isRange = true
        let lastIssueIndex = this.publicationIssues.findIndex(
          (issue) => issue === max
        )
        if (lastIssueIndex === -1) {
          ;[lastIssueIndex] = Object.keys(this.publicationIssues).slice(-1)
          console.warn(
            `Issue ${max} doesn't exist, falling back to ${this.publicationIssues[lastIssueIndex]}`
          )
        }

        this.issuenumbers = this.publicationIssues.filter(
          (unused, index) => index >= firstIssueIndex && index <= lastIssueIndex
        )
      }
    },
    async loadItems({ itemType }) {
      const items = (
        await this.$nuxt.$axios.$get(
          `/fs/browse/${itemType}/${this.publicationcode}`
        )
      ).sort(numericSortCollator.compare)
      if (itemType === 'elements') {
        this.publicationElements = items
      } else {
        this.publicationPhotos = items
      }
    },
    async loadPublicationIssues() {
      return coa().fetchIssueNumbers([this.publicationcode])
    },
    async loadSurroundingEdges() {
      const firstIssueIndex = this.publicationIssues.findIndex(
        (issue) => issue === this.issuenumbers[0]
      )
      const lastIssueIndex = this.publicationIssues.findIndex(
        (issue) => issue === this.issuenumbers[this.issuenumbers.length - 1]
      )
      const issuesBefore = this.publicationIssues.filter(
        (unused, index) =>
          firstIssueIndex !== -1 &&
          index >= firstIssueIndex - 10 &&
          index < firstIssueIndex
      )
      const issuesAfter = this.publicationIssues.filter(
        (unused, index) =>
          lastIssueIndex !== -1 &&
          index > lastIssueIndex &&
          index <= lastIssueIndex + 10
      )

      const getEdgePublicationStates = async (edges) =>
        this.$nuxt.$axios
          .$get(`/api/edges/${this.publicationcode}/${edges.join(',')}`)
          .then((data) =>
            data.sort(
              ({ issuenumber: issuenumber1 }, { issuenumber: issuenumber2 }) =>
                Math.sign(
                  edges.indexOf(issuenumber1) - edges.indexOf(issuenumber2)
                )
            )
          )

      if (issuesBefore.length) {
        this.edgesBefore = await getEdgePublicationStates(issuesBefore)
      }

      if (issuesAfter.length) {
        this.edgesAfter = await getEdgePublicationStates(issuesAfter)
      }
    },

    getChunkedRequests: async ({
      api,
      url,
      parametersToChunk,
      chunkSize,
      suffix = '',
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
            ).concat(await api.get(`${url}${codeChunk.join(',')}${suffix}`)),
          Promise.resolve([])
        )
      ),
  },
})
