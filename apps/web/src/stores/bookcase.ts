import BookcaseServices from "~dm-services/bookcase/types";
import { BookcaseEdge } from "~dm-types/BookcaseEdge";
import { issue_condition } from "~prisma-clients/extended/dm.extends";
import { EventReturnType } from "~socket.io-services/types";

import { dmSocketInjectionKey } from "../composables/useDmSocket";
import { collection } from "./collection";

export type SimpleBookcaseEdge = Pick<
  BookcaseEdge,
  "publicationcode" | "issuenumber"
> & {
  issueCondition?: issue_condition;
};

export type BookcaseEdgeWithPopularity = BookcaseEdge & {
  issueCondition?: issue_condition;
  popularity?: number | undefined;
};

export const bookcase = defineStore("bookcase", () => {
  const route = useRoute();

  console.log("bookcase store");
  const {
    bookcase: { services: bookcaseServices },
  } = injectLocal(dmSocketInjectionKey)!;

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
            const issueCode = `${issue.publicationcode} ${issue.issuenumber}`;
            return {
              ...issue,
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
        const response = await bookcaseServices.getBookcase(
          collection().user!.username,
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
        const response = await bookcaseServices.getBookcaseOptions(
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
      await bookcaseServices.setBookcaseOptions(bookcaseOptions.value!);
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        const response = await bookcaseServices.getBookcaseOrder(
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
      await bookcaseServices.setBookcaseOrder(bookcaseOrder.value!);
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
