import type { SuccessfulEventOutput } from "socket-call-client";

import type { ClientEvents as BookcaseEvents } from "~dm-services/bookcase";
import type { BookcaseEdge } from "~dm-types/BookcaseEdge";
import type { issue_condition } from "~prisma-schemas/schemas/dm/client/client";

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
  const route = useRoute<"/bookcase/show/[username]">();

  const {
    privateBookcase: privateBookcaseEvents,
    userBookcase: userBookcaseEvents,
  } = inject(socketInjectionKey)!;

  const loadedSprites = ref<{ [key: string]: string }>({}),
    isPrivateBookcase = ref(false),
    isUserNotExisting = ref(false),
    bookcaseUsername = ref<string>(),
    bookcaseContents =
      shallowRef<
        SuccessfulEventOutput<BookcaseEvents, "getBookcase">["edges"]
      >(),
    bookcaseOptions =
      shallowRef<SuccessfulEventOutput<BookcaseEvents, "getBookcaseOptions">>(),
    bookcaseOrder = ref<string[]>(),
    edgeIndexToLoad = ref(0),
    isSharedBookcase = computed(() => route.params.username !== undefined),
    bookcaseWithPopularities = computed(
      () =>
        ((isSharedBookcase.value
          ? true
          : collection().popularIssuesInCollection) &&
          bookcaseContents.value?.map((issue) => ({
            ...issue,
            popularity: isSharedBookcase.value
              ? 0
              : collection().popularIssuesInCollection?.[issue.issuecode] || 0,
          }))) ||
        null,
    ),
    popularIssuesInCollectionWithoutEdge = computed(() =>
      bookcaseWithPopularities.value
        ?.filter(
          ({ edgeId, popularity }) => !edgeId && popularity && popularity > 0,
        )
        .sort(({ popularity: popularity1 }, { popularity: popularity2 }) =>
          popularity2 && popularity1 ? popularity2 - popularity1 : 0,
        ),
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
      if (!bookcaseContents.value) {
        const response = await userBookcaseEvents.getBookcase(
          bookcaseUsername.value!,
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
          bookcaseContents.value = response.edges;
          for (const issue of bookcaseContents.value) {
            coa().issuecodeDetails[issue.issuecode] = {
              issuecode: issue.issuecode,
              publicationcode: issue.publicationcode,
              issuenumber: issue.issuenumber,
              title: issue.title,
            };
          }
        }
      }
    },
    loadBookcaseOptions = async () => {
      if (!bookcaseOptions.value) {
        const response = await userBookcaseEvents.getBookcaseOptions(
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
      await privateBookcaseEvents.setBookcaseOptions(bookcaseOptions.value!);
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        const response = await userBookcaseEvents.getBookcaseOrder(
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
      await privateBookcaseEvents.setBookcaseOrder(bookcaseOrder.value!);
    };

  return {
    loadedSprites,
    isPrivateBookcase,
    isUserNotExisting,
    bookcaseUsername,
    bookcaseContents,
    bookcaseOptions,
    bookcaseOrder,
    edgeIndexToLoad,
    isSharedBookcase,
    popularIssuesInCollectionWithoutEdge,
    bookcaseWithPopularities,
    addLoadedSprite,
    loadBookcase,
    loadBookcaseOptions,
    updateBookcaseOptions,
    loadBookcaseOrder,
    updateBookcaseOrder,
  };
});
