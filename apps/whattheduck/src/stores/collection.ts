import axios from "axios";
import { defineStore } from "pinia";
import {IssueWithPublicationCode} from "@/types/IssueWithPublicationCode";
import {Purchase} from "@/types/Purchase";
import {Author} from "@/types/Author";
import {SuggestionList} from "@/types/SuggestionList";
import {Subscription} from "@/types/Subscription";
import {IssuePopularity} from "@/types/IssuePopularity";
import {EdgePublishedRecently, EdgePublishedRecentlyWithTimestamp} from "@/types/EdgePublishedRecently";
import {User} from "@/types/User";
import {PreviousVisit} from "@/types/PreviousVisit";
import {Issue} from "@/types/Issue";

export const collection = defineStore("collection", {
  state: () => ({
    collection: null as IssueWithPublicationCode[]|null,
    purchases: null as Purchase[]|null,
    watchedAuthors: null as Author[]|null,
    suggestions: null as SuggestionList|null,
    subscriptions: null as Subscription[]|null,

    popularIssuesInCollection: null as { [key: string]: number } | null,
    lastPublishedEdgesForCurrentUser: null as EdgePublishedRecentlyWithTimestamp[]|null,

    isLoadingCollection: false,
    isLoadingPurchases: false,
    isLoadingWatchedAuthors: false,
    isLoadingSuggestions: false,
    isLoadingSubscriptions: false,

    user: null as User|null,
    previousVisit: null as PreviousVisit|null,
  }),

  getters: {
    total: ({ collection }) => collection?.length,

    duplicateIssues: ({ collection }): { [key: string]: IssueWithPublicationCode[] }|null => {
      if (collection) {
        const issuesByIssueCode = collection.reduce((acc, issue) => {
          const issuecode = `${issue.publicationCode} ${issue.issueNumber}`;
          if (!acc[issuecode]) {
            acc[issuecode] = [];
          }
          return {
            ...acc,
            [issuecode]: [...acc[issuecode], issue],
          };
        }, {} as { [key: string]: IssueWithPublicationCode[] });
        return Object.keys(issuesByIssueCode).reduce((acc, issuecode) => {
          const issues = issuesByIssueCode[issuecode];
          return issues.length > 1 ? { ...acc, [issuecode]: issues } : acc;
        }, {});
      }
      return null
    },

    issuesInToReadStack: ({ collection }) =>
      collection && collection.filter(({ isToRead }) => isToRead),

    // totalUniqueIssues: ({ collection, duplicateIssues }): { [key: string]: number}|null =>
    //   duplicateIssues &&
    //   (collection?.length || 0) -
    //     Object.values(duplicateIssues).reduce(
    //       (acc: number, duplicatedIssue) => acc + duplicatedIssue.length - 1,
    //       0
    //     ),

    totalPerCountry: ({ collection }) =>
      collection?.reduce(
        (acc, issue) => ({
          ...acc,
          [issue.country]: (acc[issue.country] || 0) + 1,
        }),
        {} as { [key: string]: number}
      ),

    totalPerPublication: ({ collection }): { [key: string]: number }|undefined =>
      collection?.reduce((acc, issue) => {
        const publicationCode = `${issue.country}/${issue.magazine}`;
        return { ...acc, [publicationCode]: (acc[publicationCode] || 0) + 1 };
      }, {} as { [key: string]: number }),

    hasSuggestions: ({ suggestions }) =>
      suggestions?.issues && Object.keys(suggestions.issues).length,

    issueNumbersPerPublication: ({ collection }): { [key: string]: string[] }|undefined =>
      collection?.reduce(
        (acc, { country, issueNumber, magazine }) => ({
          ...acc,
          [`${country}/${magazine}`]: [
            ...(acc[`${country}/${magazine}`] || []),
            issueNumber,
          ],
        }),
        {} as { [key: string]: string[] }
      ),

    // totalPerPublicationUniqueIssueNumbers: ({ issueNumbersPerPublication }) =>
    //   issueNumbersPerPublication &&
    //   Object.keys(issueNumbersPerPublication).reduce(
    //     (acc, publicationCode) => ({
    //       ...acc,
    //       [publicationCode]: [
    //         ...new Set(issueNumbersPerPublication[publicationCode]),
    //       ].length,
    //     }),
    //     {}
    //   )
  },

  actions: {
    setPreviousVisit(previousVisit: PreviousVisit|null) {
      this.previousVisit = previousVisit;
    },
    async loadCollection(afterUpdate = false) {
      if (afterUpdate || (!this.isLoadingCollection && !this.collection)) {
        this.isLoadingCollection = true;
        this.collection = (await axios.get("/collection/issues")).data.map(
          (issue: Issue) => ({
            ...issue,
            publicationCode: `${issue.country}/${issue.magazine}`,
          })
        );
        this.isLoadingCollection = false;
      }
    },
    async loadPurchases(afterUpdate = false) {
      if (afterUpdate || (!this.isLoadingPurchases && !this.purchases)) {
        this.isLoadingPurchases = true;
        this.purchases = (await axios.get("/collection/purchases")).data;
        this.isLoadingPurchases = false;
      }
    },
    async loadWatchedAuthors(afterUpdate = false) {
      if (
        afterUpdate ||
        (!this.isLoadingWatchedAuthors && !this.watchedAuthors)
      ) {
        this.isLoadingWatchedAuthors = true;
        this.watchedAuthors = (
          await axios.get("/collection/authors/watched")
        ).data;
        this.isLoadingWatchedAuthors = false;
      }
    },
    async loadSuggestions(
        { countryCode, sort, sinceLastVisit }:
            {countryCode: string|null, sort: string|null, sinceLastVisit: boolean}
    ) {
      if (!this.isLoadingSuggestions) {
        this.isLoadingSuggestions = true;
        this.suggestions = (
          await axios.get(
            `/collection/stats/suggestedissues/${[
              countryCode || "ALL",
              sinceLastVisit ? "since_previous_visit" : "_",
              sort,
              sinceLastVisit ? 100 : 20,
            ].join("/")}`
          )
        ).data;
        this.isLoadingSuggestions = false;
      }
    },
    async loadSubscriptions(afterUpdate = false) {
      if (
        afterUpdate ||
        (!this.isLoadingSubscriptions && !this.subscriptions)
      ) {
        this.isLoadingSubscriptions = true;
        this.subscriptions = (
          await axios.get("/collection/subscriptions")
        ).data;
        this.isLoadingSubscriptions = false;
      }
    },
    async loadPopularIssuesInCollection() {
      if (!this.popularIssuesInCollection) {
        this.popularIssuesInCollection = (
          ((await axios.get("/collection/popular"))
        ).data as IssuePopularity[]).reduce(
          (acc, issue) => ({
            ...acc,
            [`${issue.country}/${issue.magazine} ${issue.issueNumber}`]:
              issue.popularity,
          }),
          {}
        );
      }
    },
    async loadLastPublishedEdgesForCurrentUser() {
      if (!this.lastPublishedEdgesForCurrentUser) {
        this.lastPublishedEdgesForCurrentUser = (
          await axios.get("/collection/edges/lastPublished")
        ).data.map((edge: EdgePublishedRecently) => ({
          ...edge,
          timestamp: Date.parse(edge.creationDate) / 1000,
        }));
      }
    },

    async loadUser(afterUpdate = false) {
      if (afterUpdate || !this.user) {
        this.user = Object.entries(
          (await axios.get(`/collection/user`)).data
        ).reduce((acc, [key, value]) => {
          switch (key) {
            case "accepterpartage":
              acc.isShareEnabled = value as boolean;
              break;
            case "affichervideo":
              acc.isVideoShown = value as boolean;
              break;
            case "email":
              acc.email = value as string;
              break;
            case "presentationSentence":
              acc.presentationSentence = value as string;
              break;
          }
          return acc;
        }, {} as User);
      }
    },
  },
});
