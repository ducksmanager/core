import type { AxiosError } from 'axios';
import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { collection } from './collection';

import { call } from '~/axios-helper';
import type { BookcaseEdge } from '~dm_types/BookcaseEdge';
import {
  GET__bookcase__$username,
  GET__bookcase__$username__options,
  GET__bookcase__$username__sort,
  POST__bookcase__options,
  POST__bookcase__sort,
} from '~dm_types/routes';

export interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  publicationcode: string;
  issueCode: string;
  popularity?: number | undefined;
}

export const bookcase = defineStore('bookcase', () => {
  const loadedSprites = ref({} as { [key: string]: string }),
    isPrivateBookcase = ref(false as boolean),
    isUserNotExisting = ref(false as boolean),
    bookcaseUsername = ref(null as string | null),
    bookcase = ref(null as BookcaseEdge[] | null),
    bookcaseOptions = ref(null as GET__bookcase__$username__options['resBody'] | null),
    bookcaseOrder = ref(null as string[] | null),
    edgeIndexToLoad = ref(0 as number),
    isSharedBookcase = computed((): boolean => collection().user?.username !== bookcaseUsername.value),
    bookcaseWithPopularities = computed(
      (): BookcaseEdgeWithPopularity[] | null =>
        ((isSharedBookcase.value ? true : collection().popularIssueInCollectionByIssuecode) &&
          bookcase.value?.map((issue) => {
            const publicationcode = `${issue.countryCode}/${issue.magazineCode}`;
            const issueCode = `${publicationcode} ${issue.issuenumber}`;
            return {
              ...issue,
              publicationcode,
              issueCode,
              popularity: isSharedBookcase.value
                ? 0
                : collection().popularIssueInCollectionByIssuecode?.[issueCode] || 0,
            };
          })) ||
        null
    ),
    addLoadedSprite = ({ spritePath, css }: { spritePath: string; css: string }) => {
      loadedSprites.value = {
        ...loadedSprites.value,
        [spritePath]: css,
      };
    },
    loadBookcase = async () => {
      if (!bookcase.value) {
        try {
          bookcase.value = (
            await call(
              axios,
              new GET__bookcase__$username({
                params: { username: bookcaseUsername.value! },
              })
            )
          ).data;
        } catch (e) {
          switch ((e as AxiosError).response?.status) {
            case 403:
              isPrivateBookcase.value = true;
              break;
            case 404:
              isUserNotExisting.value = true;
              break;
          }
        }
      }
    },
    loadBookcaseOptions = async () => {
      if (!bookcaseOptions.value) {
        bookcaseOptions.value = (
          await call(
            axios,
            new GET__bookcase__$username__options({
              params: { username: bookcaseUsername.value! },
            })
          )
        ).data;
      }
    },
    updateBookcaseOptions = async () => {
      await call(
        axios,
        new POST__bookcase__options({
          reqBody: bookcaseOptions.value!,
        })
      );
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        bookcaseOrder.value = (
          await call(
            axios,
            new GET__bookcase__$username__sort({
              params: { username: bookcaseUsername.value! },
            })
          )
        ).data;
      }
    },
    updateBookcaseOrder = async () => {
      await call(
        axios,
        new POST__bookcase__sort({
          reqBody: { sorts: bookcaseOrder.value as string[] },
        })
      );
    };

  return {
    loadedSprites,
    isPrivateBookcase,
    isUserNotExisting,
    bookcaseUsername,
    bookcase,
    bookcaseOptions,
    bookcaseOrder,
    edgeIndexToLoad,
    isSharedBookcase,
    bookcaseWithPopularities,
    addLoadedSprite,
    loadBookcase,
    loadBookcaseOptions,
    updateBookcaseOptions,
    loadBookcaseOrder,
    updateBookcaseOrder,
  };
});
