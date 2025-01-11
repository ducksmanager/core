import type { SuccessfulEventOutput } from "socket-call-server";

import type { ClientEvents as BookcaseEvents } from "~dm-services/bookcase";
import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import type { issue_condition } from "~prisma-schemas/schemas/dm";

import { socketInjectionKey } from "../composables/useDmSocket";
import { collection } from "./collection";

export type SimpleBookcaseEdge = Pick<BookcaseEdge, "issuecode"> & {
  issueCondition?: issue_condition;
};

export type BookcaseEdgeWithPopularity = BookcaseEdge & {
  issueCondition?: issue_condition;
  popularity?: number | undefined;
};

export const bookcase = defineStore("bookcase", () => {
  const route = useRoute();

  const {
    bookcase: { events: bookcaseEvents },
    userBookcase: { events: userBookcaseEvents },
  } = inject(socketInjectionKey)!;

  const loadedSprites = ref<{ [key: string]: string }>({}),
    isPrivateBookcase = ref(false),
    isUserNotExisting = ref(false),
    bookcaseUsername = ref<string>(),
    bookcase = shallowRef<BookcaseEdge[]>(),
    bookcaseOptions =
      shallowRef<SuccessfulEventOutput<BookcaseEvents, "getBookcaseOptions">>(),
    bookcaseOrder = ref<string[]>(),
    edgeIndexToLoad = ref(0),
    isSharedBookcase = computed(() => route.params.username !== undefined),
    bookcaseWithPopularities = computed(
      (): BookcaseEdgeWithPopularity[] | null =>
        ((isSharedBookcase.value
          ? true
          : collection().popularIssuesInCollection) &&
          bookcase.value?.map(({ issuecode, ...issue }) => ({
            ...issue,
            ...coa().issuecodeDetails[issuecode],
            popularity: isSharedBookcase.value
              ? 0
              : collection().popularIssuesInCollection?.[issuecode] || 0,
          }))) ||
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
        const response = await bookcaseEvents.getBookcase(
          collection().user!.username,
        );
        if ("error" in response) {
          switch (response.error) {
            case "Forbidden":
              isPrivateBookcase.value = true;
              return;
            case "Not found":
              isUserNotExisting.value = true;
              return;
          }
        } else {
          bookcase.value = response.edges;
        }
      }
    },
    loadBookcaseOptions = async () => {
      if (!bookcaseOptions.value) {
        const response = await bookcaseEvents.getBookcaseOptions(
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
      await userBookcaseEvents.setBookcaseOptions(bookcaseOptions.value!);
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        const response = await bookcaseEvents.getBookcaseOrder(
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
      // TODO implement
      // await userBookcaseEvents.setBookcaseOrder(bookcaseOrder.value!);
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
