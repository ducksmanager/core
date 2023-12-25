import { AxiosError } from "axios";
import { Socket } from "socket.io-client";

import { Services as BookcaseServices } from "~api/services/bookcase/types";
import { EventReturnType } from "~api/services/types";
import { BookcaseEdge } from "~dm-types/BookcaseEdge";

import { collection } from "./collection";

export interface BookcaseEdgeWithPopularity extends BookcaseEdge {
  publicationcode: string;
  issueCode: string;
  popularity?: number | undefined;
}

let socket: Socket<BookcaseServices>;
export const bookcase = defineStore("bookcase", () => {
  const route = useRoute();
  const loadedSprites = ref({} as { [key: string]: string }),
    isPrivateBookcase = ref(false as boolean),
    isUserNotExisting = ref(false as boolean),
    bookcaseUsername = ref(null as string | null),
    bookcase = ref(null as BookcaseEdge[] | null),
    bookcaseOptions = ref(
      null as EventReturnType<BookcaseServices["getBookcaseOptions"]> | null,
    ),
    bookcaseOrder = ref(null as string[] | null),
    edgeIndexToLoad = ref(0 as number),
    isSharedBookcase = computed(
      (): boolean => route.params.username !== undefined,
    ),
    bookcaseWithPopularities = computed(
      (): BookcaseEdgeWithPopularity[] | null =>
        ((isSharedBookcase.value
          ? true
          : collection().popularIssuesInCollection) &&
          bookcase.value?.map((issue) => {
            const publicationcode = `${issue.countryCode}/${issue.magazineCode}`;
            const issueCode = `${publicationcode} ${issue.issuenumber}`;
            return {
              ...issue,
              publicationcode,
              issueCode,
              popularity: isSharedBookcase.value
                ? 0
                : collection().popularIssuesInCollection?.[issueCode] || 0,
            };
          })) ||
        null,
    ),
    addLoadedSprite = ({
      spritePath,
      css,
    }: {
      spritePath: string;
      css: string;
    }) => {
      loadedSprites.value = {
        ...loadedSprites.value,
        [spritePath]: css,
      };
    },
    loadBookcase = async () => {
      if (!bookcase.value) {
        try {
          bookcase.value = (
            await socket.emitWithAck("getBookcase", bookcaseUsername.value!)
          ).edges;
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
        bookcaseOptions.value = await socket.emitWithAck(
          "getBookcaseOptions",
          bookcaseUsername.value!,
        );
      }
    },
    updateBookcaseOptions = async () => {
      await socket.emitWithAck("setBookcaseOptions", bookcaseOptions.value!);
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        bookcaseOrder.value = (
          await socket.emitWithAck("getBookcaseOrder", bookcaseUsername.value!)
        ).publicationCodes;
      }
    },
    updateBookcaseOrder = async () => {
      await socket.emitWithAck("setBookcaseOrder", bookcaseOrder.value!);
    };

  return {
    setSocket: (params: { socket: typeof socket }) => {
      socket = params.socket;
    },
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
