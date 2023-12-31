import { Socket } from "socket.io-client";

import { BookcaseEdge } from "~dm-types/BookcaseEdge";
import { Services as BookcaseServices } from "~services/bookcase/types";
import { EventReturnType } from "~services/types";

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
        const response = await socket.emitWithAck(
          "getBookcase",
          bookcaseUsername.value!,
        );
        switch (response.error) {
          case "Forbidden":
            isPrivateBookcase.value = true;
            return;
          case "Not found":
            isUserNotExisting.value = true;
            return;
          case undefined:
            bookcase.value = response.edges;
        }
      }
    },
    loadBookcaseOptions = async () => {
      if (!bookcaseOptions.value) {
        const response = await socket.emitWithAck(
          "getBookcaseOptions",
          bookcaseUsername.value!,
        );
        if ("error" in response) {
          console.error(response.error);
        } else {
          bookcaseOptions.value = response;
        }
      }
    },
    updateBookcaseOptions = async () => {
      await socket.emitWithAck("setBookcaseOptions", bookcaseOptions.value!);
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        const response = await socket.emitWithAck(
          "getBookcaseOrder",
          bookcaseUsername.value!,
        );
        if ("error" in response) {
          console.error(response.error);
        } else {
          bookcaseOrder.value = response.publicationCodes;
        }
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
