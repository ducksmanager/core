import { useCookies } from "@vueuse/integrations/useCookies";
import { defineStore } from "pinia";

import { api } from "~/stores/api";
import { BookcaseEdge } from "~dm_types/BookcaseEdge";
import {
  GET__bookcase__$username,
  GET__collection__popular,
  GET__collection__user,
  GET__collection__user_privileges,
  GET__global_stats__user__$userIds,
} from "~dm_types/routes";
import { user, userPermission } from "~prisma_clients/client_dm";
import { edgeContributor } from "~prisma_clients/client_edgecreator";

import { call } from "../../axios";
const a: edgeContributor | null = null;
console.log(a);

export interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  publicationcode: string;
  issueCode: string;
  popularity: number | null;
}

export const collection = defineStore("collection", {
  state: () => ({
    user: undefined as Omit<user, "password"> | undefined | null,
    userPermissions: null as userPermission[] | null,
    userPhotographerPoints: null as number | null,
    bookcase: null as BookcaseEdge[] | null,
    popularIssuesInCollection: null as Record<string, number> | null,
  }),

  getters: {
    isSharedBookcase: () => false,

    bookcaseWithPopularities(): BookcaseEdgeWithPopularity[] | null {
      const isSharedBookcase = this.isSharedBookcase;
      const popularIssuesInCollection = this.popularIssuesInCollection;
      return (
        ((isSharedBookcase ? true : popularIssuesInCollection) &&
          this.bookcase?.map((issue) => {
            const publicationcode = `${issue.countryCode}/${issue.magazineCode}`;
            const issueCode = `${publicationcode} ${issue.issuenumber}`;
            return {
              ...issue,
              publicationcode,
              issueCode,
              popularity: isSharedBookcase
                ? null
                : popularIssuesInCollection?.[issueCode] || 0,
            };
          })) ||
        null
      );
    },

    popularIssuesInCollectionWithoutEdge: ():
      | BookcaseEdgeWithPopularity[]
      | undefined =>
      collection()
        .bookcaseWithPopularities?.filter(
          ({ edgeId, popularity }) => !edgeId && popularity && popularity > 0
        )
        .sort(({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 && popularity1 ? popularity2 - popularity1 : 0
        ),
  },

  actions: {
    async loadBookcase() {
      this.bookcase = (
        await call(
          api().dmApi,
          new GET__bookcase__$username({
            params: { username: this.user!.username },
          })
        )
      ).data;
    },
    async loadPopularIssuesInCollection() {
      if (!this.popularIssuesInCollection) {
        this.popularIssuesInCollection = (
          await call(api().dmApi, new GET__collection__popular())
        ).data.reduce(
          (acc, { country, issuenumber, magazine, popularity }) => ({
            ...acc,
            [`${country}/${magazine} ${issuenumber}`]: popularity,
          }),
          {}
        );
      }
    },

    async fetchUserPoints() {
      const userId = this.user!.id;
      const userData = (
        await call(
          api().dmApi,
          new GET__global_stats__user__$userIds({
            params: { userIds: String(userId) },
          })
        )
      ).data;
      this.userPhotographerPoints = userData.points[userId].edge_photographer;
    },

    async loadUser() {
      const cookies = useCookies();
      try {
        if (cookies.get("token")) {
          this.user = (
            await call(api().dmApi, new GET__collection__user())
          ).data;
          this.userPermissions = (
            await call(api().dmApi, new GET__collection__user_privileges())
          ).data;
        }
      } catch (e) {
        console.error(e);
        // cookies.remove("token");
        this.user = null;
      }
    },
  },
});
