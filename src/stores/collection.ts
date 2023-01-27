import axios from "axios";
import Cookies from "js-cookie";
import { defineStore } from "pinia";

import {
  authorUser,
  edge,
  issue,
  issue_condition,
  purchase,
  subscription,
  user,
} from "~prisma_clients/client_dm";
import {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~types/CollectionUpdate";
import { IssueSuggestion } from "~types/IssueSuggestion";
import { PopularIssue } from "~types/PopularIssue";
import {
  DELETE__collection__purchases__$id,
  GET__collection__authors__watched,
  GET__collection__edges__lastPublished,
  GET__collection__issues,
  GET__collection__options__$optionName,
  GET__collection__popular,
  GET__collection__purchases,
  GET__collection__stats__suggestedissues__$countrycode__$sincePreviousVisit__$sort__$limit,
  GET__collection__subscriptions,
  GET__collection__user,
  POST__collection__issues__multiple,
  POST__collection__issues__single,
  POST__collection__lastvisit,
  POST__collection__options__$optionName,
  PUT__collection__purchases,
} from "~types/routes";
import { StoryDetail } from "~types/StoryDetail";
import { UserForAccountForm } from "~types/UserForAccountForm";

import { bookcase } from "./bookcase";
import { coa } from "./coa";

export type IssueWithPublicationcode = issue & {
  publicationcode: string;
};

export type IssueWithPublicationcodeOptionalId = Omit<
  IssueWithPublicationcode,
  "id"
> & {
  id: number | null;
};

export type SubscriptionTransformed = Omit<
  subscription,
  "country" | "magazine"
> & {
  publicationcode: string;
};

type SubscriptionTransformedStringDates = Omit<
  SubscriptionTransformed,
  "startDate" | "endDate"
> & {
  startDate: string;
  endDate: string;
};

type IssueSuggestionWithStringDate = Omit<IssueSuggestion, "oldestdate"> & {
  oldestdate: string;
};

type LastPublishedEdge = edge & {
  issuecode: string;
  timestamp: number;
};

export type purchaseWithStringDate = Omit<purchase, "date"> & {
  date: string;
};

export const collection = defineStore("collection", {
  state: () => ({
    collection: null as IssueWithPublicationcode[] | null,
    watchedPublicationsWithSales: null as string[] | null,
    purchases: null as purchaseWithStringDate[] | null,
    watchedAuthors: null as authorUser[] | null,
    marketplaceContactMethods: null as string[] | null,

    suggestions: null as {
      issues: { [issuecode: string]: IssueSuggestionWithStringDate };
      minScore: number;
      maxScore: number;
      authors: { [personcode: string]: string };
      storyDetails?: { [storycode: string]: StoryDetail } | undefined;
      publicationTitles: { [publicationcode: string]: string | null };
    } | null,
    subscriptions: null as SubscriptionTransformed[] | null,

    popularIssuesInCollection: null as { [issuecode: string]: number } | null,
    lastPublishedEdgesForCurrentUser: null as LastPublishedEdge[] | null,

    isLoadingUser: false as boolean,
    isLoadingCollection: false as boolean,
    isLoadingWatchedPublicationsWithSales: false as boolean,
    isLoadingMarketplaceContactMethods: false as boolean,
    isLoadingPurchases: false as boolean,
    isLoadingWatchedAuthors: false as boolean,
    isLoadingSuggestions: false as boolean,
    isLoadingSubscriptions: false as boolean,

    user: undefined as Omit<user, "password"> | undefined | null,
    previousVisit: null as Date | null,
  }),

  getters: {
    total: ({ collection }): number | undefined => collection?.length,

    issuesByIssueCode: ({ collection }) =>
      collection?.reduce((acc, issue) => {
        const issuecode = `${issue.publicationcode} ${issue.issuenumber}`;
        return {
          ...acc,
          [issuecode]: [...(acc[issuecode] || []), issue],
        };
      }, {} as { [issuecode: string]: IssueWithPublicationcode[] }),

    duplicateIssues(): {
      [issuecode: string]: IssueWithPublicationcode[];
    } {
      const issuesByIssueCode = this.issuesByIssueCode;
      return (
        (issuesByIssueCode &&
          Object.keys(issuesByIssueCode).reduce(
            (acc, issuecode) =>
              issuesByIssueCode[issuecode].length > 1
                ? {
                    ...acc,
                    [issuecode]: issuesByIssueCode[issuecode],
                  }
                : acc,
            {}
          )) ||
        {}
      );
    },

    issuesInToReadStack: ({ collection }) =>
      collection && collection.filter(({ isToRead }) => isToRead),

    issuesInOnSaleStack: ({ collection }) =>
      collection && collection.filter(({ isOnSale }) => isOnSale),

    totalUniqueIssues(): number {
      return (
        (this.duplicateIssues &&
          (!this.collection?.length
            ? 0
            : this.collection?.length -
              Object.values(this.duplicateIssues).reduce(
                (acc, duplicatedIssue) => acc + duplicatedIssue.length - 1,
                0
              ))) ||
        0
      );
    },

    totalPerCountry: ({ collection }) =>
      collection?.reduce(
        (acc, issue) => ({
          ...acc,
          [issue.country]: (acc[issue.country] || 0) + 1,
        }),
        {} as { [countrycode: string]: number }
      ),

    totalPerPublication: ({ collection }) =>
      collection?.reduce((acc, issue) => {
        const publicationcode = `${issue.country}/${issue.magazine}`;
        return { ...acc, [publicationcode]: (acc[publicationcode] || 0) + 1 };
      }, {} as { [publicationcode: string]: number }) || null,

    purchasesById: ({
      purchases,
    }): { [id: number]: purchaseWithStringDate } | undefined =>
      purchases?.reduce(
        (acc, purchase) => ({ ...acc, [purchase.id]: purchase }),
        {}
      ),

    hasSuggestions: ({ suggestions }) =>
      suggestions?.issues && Object.keys(suggestions.issues).length,

    issueNumbersPerPublication(): { [publicationcode: string]: string[] } {
      return (
        this.collection?.reduce(
          (acc, { country, issuenumber, magazine }) => ({
            ...acc,
            [`${country}/${magazine}`]: [
              ...(acc[`${country}/${magazine}`] || []),
              issuenumber,
            ],
          }),
          {} as { [publicationcode: string]: string[] }
        ) || {}
      );
    },

    totalPerPublicationUniqueIssueNumbers(): {
      [publicationcode: string]: number;
    } {
      const issueNumbersPerPublication: {
        [publicationcode: string]: string[];
      } = this.issueNumbersPerPublication;
      return (
        issueNumbersPerPublication &&
        Object.keys(issueNumbersPerPublication).reduce(
          (acc, publicationcode) => ({
            ...acc,
            [publicationcode]: [
              ...new Set(issueNumbersPerPublication[publicationcode]),
            ].length,
          }),
          {}
        )
      );
    },

    totalPerPublicationUniqueIssueNumbersSorted(): [string, number][] {
      const totalPerPublicationUniqueIssueNumbers =
        this.totalPerPublicationUniqueIssueNumbers;
      return (
        totalPerPublicationUniqueIssueNumbers &&
        Object.entries(totalPerPublicationUniqueIssueNumbers).sort(
          ([publicationcode1], [publicationcode2]) =>
            Math.sign(
              totalPerPublicationUniqueIssueNumbers[publicationcode2]! -
                totalPerPublicationUniqueIssueNumbers[publicationcode1]!
            )
        )
      );
    },

    popularIssuesInCollectionWithoutEdge: () =>
      bookcase()
        .bookcaseWithPopularities?.filter(
          ({ edgeId, popularity }) => !edgeId && popularity && popularity > 0
        )
        .sort(({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 && popularity1 ? popularity2 - popularity1 : 0
        ),

    quotedIssues():
      | {
          publicationcode: string;
          issuenumber: string;
          condition: issue_condition;
          estimation: number;
          estimationGivenCondition: number;
        }[]
      | null {
      const issueQuotations = coa().issueQuotations;
      if (issueQuotations === null) {
        return null;
      }
      const getEstimation = (publicationcode: string, issuenumber: string) => {
        const estimationData =
          issueQuotations[`${publicationcode} ${issuenumber}`];
        return (
          (estimationData &&
            (estimationData.max
              ? ((estimationData.min || 0) + estimationData.max) / 2
              : estimationData.min)) ||
          0
        );
      };
      const CONDITION_TO_ESTIMATION_PCT = {
        bon: 1,
        moyen: 0.7,
        mauvais: 0.3,
        indefini: 0.7,
        "": 0.7,
      };
      return (
        this.collection
          ?.filter(({ publicationcode, issuenumber }) =>
            getEstimation(publicationcode, issuenumber)
          )
          .map(({ publicationcode, issuenumber, condition }) => {
            const estimation = getEstimation(publicationcode, issuenumber);
            return {
              publicationcode,
              issuenumber,
              condition,
              estimation,
              estimationGivenCondition: parseFloat(
                (CONDITION_TO_ESTIMATION_PCT[condition] * estimation).toFixed(1)
              ),
            };
          }) || null
      );
    },

    quotationSum(): number | null {
      return this.quotedIssues
        ? Math.round(
            this.quotedIssues?.reduce(
              (acc, { estimationGivenCondition }) =>
                acc + estimationGivenCondition,
              0
            ) || 0
          )
        : null;
    },

    userForAccountForm(): UserForAccountForm | null {
      if (!this.user) {
        return null;
      }
      return {
        ...this.user,
        discordId: this.user.discordId || undefined,
        presentationText: this.user.presentationText || "",
        email: this.user.email!,
        okForExchanges: this.user.marketplaceAcceptsExchanges || false,
      };
    },
  },

  actions: {
    async updateCollectionSingleIssue(data: CollectionUpdateSingleIssue) {
      await POST__collection__issues__single(axios, data);
      await this.loadCollection(true);
    },
    async updateCollectionMultipleIssues(data: CollectionUpdateMultipleIssues) {
      await POST__collection__issues__multiple(axios, data);
      await this.loadCollection(true);
    },

    async createPurchase(date: string, description: string) {
      await PUT__collection__purchases(axios, {
        date,
        description,
      });
      await this.loadPurchases(true);
    },

    async deletePurchase(id: number) {
      await DELETE__collection__purchases__$id(axios, {
        urlParams: { id: String(id) },
      });
      await this.loadPurchases(true);
    },

    findInCollection(publicationcode: string, issuenumber: string) {
      return this.collection?.find(
        ({ country, magazine, issuenumber: collectionIssueNumber }) =>
          publicationcode === `${country}/${magazine}` &&
          collectionIssueNumber === issuenumber
      );
    },
    async loadPreviousVisit() {
      this.previousVisit = (
        await POST__collection__lastvisit(axios)
      ).data?.previousVisit;
    },
    async loadCollection(afterUpdate = false) {
      if (afterUpdate || (!this.isLoadingCollection && !this.collection)) {
        this.isLoadingCollection = true;
        this.collection = (
          (await GET__collection__issues(axios)).data as issue[]
        ).map((issue) => ({
          ...issue,
          publicationcode: `${issue.country}/${issue.magazine}`,
        }));
        this.isLoadingCollection = false;
      }
    },
    async loadPurchases(afterUpdate = false) {
      if (afterUpdate || (!this.isLoadingPurchases && !this.purchases)) {
        this.isLoadingPurchases = true;
        this.purchases = (await GET__collection__purchases(axios)).data;
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
          await GET__collection__authors__watched(axios)
        ).data;
        this.isLoadingWatchedAuthors = false;
      }
    },
    async loadWatchedPublicationsWithSales(afterUpdate = false) {
      if (
        afterUpdate ||
        (!this.isLoadingWatchedPublicationsWithSales &&
          !this.watchedPublicationsWithSales)
      ) {
        this.isLoadingWatchedPublicationsWithSales = true;
        this.watchedPublicationsWithSales = (
          await GET__collection__options__$optionName(axios, {
            urlParams: {
              optionName: "sales_notification_publications",
            },
          })
        ).data;
        this.isLoadingWatchedPublicationsWithSales = false;
      }
    },
    async loadMarketplaceContactMethods(afterUpdate = false) {
      if (
        afterUpdate ||
        (!this.isLoadingMarketplaceContactMethods &&
          !this.marketplaceContactMethods)
      ) {
        this.isLoadingMarketplaceContactMethods = true;
        this.marketplaceContactMethods = (
          await GET__collection__options__$optionName(axios, {
            urlParams: {
              optionName: "marketplace_contact_methods",
            },
          })
        ).data;
        this.isLoadingMarketplaceContactMethods = false;
      }
    },
    async updateMarketplaceContactMethods() {
      await POST__collection__options__$optionName(
        axios,
        {
          values: this.marketplaceContactMethods!,
        },
        {
          urlParams: {
            optionName: "marketplace_contact_methods",
          },
        }
      );
    },
    async updateWatchedPublicationsWithSales() {
      await POST__collection__options__$optionName(
        axios,
        {
          values: this.watchedPublicationsWithSales!,
        },
        {
          urlParams: {
            optionName: "sales_notification_publications",
          },
        }
      );
    },
    async loadSuggestions({
      countryCode,
      sort,
      sinceLastVisit,
    }: {
      countryCode: string;
      sort: string;
      sinceLastVisit: boolean;
    }) {
      if (!this.isLoadingSuggestions) {
        this.isLoadingSuggestions = true;
        this.suggestions = (
          await GET__collection__stats__suggestedissues__$countrycode__$sincePreviousVisit__$sort__$limit(
            axios,
            {
              urlParams: {
                countrycode: countryCode || "ALL",
                sincePreviousVisit: sinceLastVisit
                  ? "since_previous_visit"
                  : "_",
                sort,
                limit: sinceLastVisit ? "100" : "20",
              },
            }
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
          await GET__collection__subscriptions(axios)
        ).data.map((subscription: SubscriptionTransformedStringDates) => ({
          ...subscription,
          startDate: new Date(Date.parse(subscription.startDate)),
          endDate: new Date(Date.parse(subscription.endDate)),
        }));
        this.isLoadingSubscriptions = false;
      }
    },
    async loadPopularIssuesInCollection() {
      if (!this.popularIssuesInCollection) {
        this.popularIssuesInCollection = (
          (await GET__collection__popular(axios)).data as PopularIssue[]
        ).reduce(
          (acc, issue) => ({
            ...acc,
            [`${issue.country}/${issue.magazine} ${issue.issuenumber}`]:
              issue.popularity,
          }),
          {}
        );
      }
    },
    async loadLastPublishedEdgesForCurrentUser() {
      if (!this.lastPublishedEdgesForCurrentUser) {
        this.lastPublishedEdgesForCurrentUser = (
          (await GET__collection__edges__lastPublished(axios)).data as edge[]
        ).map((edge) => ({
          ...edge,
          issuecode: `${edge.publicationcode} ${edge.issuenumber}`,
          timestamp: edge.creationDate.getTime() / 1000,
        }));
      }
    },

    async loadUser(afterUpdate = false) {
      if (!this.isLoadingUser && (afterUpdate || !this.user)) {
        this.isLoadingUser = true;
        try {
          if (Cookies.get("token")) {
            this.user = (await GET__collection__user(axios)).data;
          }
        } catch (e) {
          console.error(e);
          Cookies.remove("token");
          this.user = null;
        } finally {
          this.isLoadingUser = false;
        }
      }
    },
  },
});
