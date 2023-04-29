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
import { user as userModel, userPermission } from "~prisma_clients/client_dm";

import { call } from "../../axios-helper";

export interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  publicationcode: string;
  issueCode: string;
  popularity: number | null;
}

export const collection = defineStore("collection", () => {
  const user = ref(undefined as Omit<userModel, "password"> | undefined | null),
    userPermissions = ref(null as userPermission[] | null),
    userPhotographerPoints = ref(null as number | null),
    bookcase = ref(null as BookcaseEdge[] | null),
    popularIssuesInCollection = ref(null as Record<string, number> | null),
    isSharedBookcase = ref(false as boolean),
    bookcaseWithPopularities = computed(
      (): BookcaseEdgeWithPopularity[] | null =>
        ((isSharedBookcase.value ? true : popularIssuesInCollection.value) &&
          bookcase.value?.map((issue) => {
            const publicationcode = `${issue.countryCode}/${issue.magazineCode}`;
            const issueCode = `${publicationcode} ${issue.issuenumber}`;
            return {
              ...issue,
              publicationcode,
              issueCode,
              popularity: isSharedBookcase.value
                ? null
                : popularIssuesInCollection.value?.[issueCode] ?? 0,
            };
          })) ||
        null
    ),
    popularIssuesInCollectionWithoutEdge = computed(
      (): BookcaseEdgeWithPopularity[] | undefined =>
        bookcaseWithPopularities.value
          ?.filter(
            ({ edgeId, popularity }) => !edgeId && popularity && popularity > 0
          )
          .sort(({ popularity: popularity1 }, { popularity: popularity2 }) =>
            popularity2 && popularity1 ? popularity2 - popularity1 : 0
          )
    ),
    hasRole = (thisPrivilege: string) =>
      userPermissions.value!.some(
        ({ privilege, role }) =>
          role === "EdgeCreator" && privilege === thisPrivilege
      ),
    loadBookcase = async () => {
      bookcase.value = (
        await call(
          api().dmApi,
          new GET__bookcase__$username({
            params: { username: user.value!.username as string },
          })
        )
      ).data;
    },
    loadPopularIssuesInCollection = async () => {
      if (!popularIssuesInCollection.value) {
        popularIssuesInCollection.value = (
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
    fetchUserPoints = async () => {
      const userId = user.value!.id as number;
      const userData = (
        await call(
          api().dmApi,
          new GET__global_stats__user__$userIds({
            params: { userIds: String(userId) },
          })
        )
      ).data;
      userPhotographerPoints.value = userData.points[userId].edge_photographer;
    },
    loadUser = async () => {
      const cookies = useCookies();
      try {
        if (cookies.get("token")) {
          user.value = (
            await call(api().dmApi, new GET__collection__user())
          ).data;
          userPermissions.value = (
            await call(api().dmApi, new GET__collection__user_privileges())
          ).data;
        } else {
          user.value = null;
        }
      } catch (e) {
        console.error(e);
        // cookies.remove("token");
        user.value = null;
      }
    };

  return {
    user,
    userPermissions,
    hasRole,
    userPhotographerPoints,
    bookcase,
    popularIssuesInCollection,
    isSharedBookcase,
    bookcaseWithPopularities,
    popularIssuesInCollectionWithoutEdge,
    loadBookcase,
    loadPopularIssuesInCollection,
    fetchUserPoints,
    loadUser,
  };
});
