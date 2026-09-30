import type { SuccessfulEventOutput } from "socket-call-client";

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
        await userBookcaseEvents
          .getBookcase(bookcaseUsername.value!)
          .then((response) => {
            bookcaseContents.value = response.edges;
            for (const issue of bookcaseContents.value) {
              coa().issuecodeDetails[issue.issuecode] = {
                issuecode: issue.issuecode,
                publicationcode: issue.publicationcode,
                issuenumber: issue.issuenumber,
                title: issue.title,
              };
            }
          })
          .catch((e) => {
            switch (e.error) {
              case "Forbidden":
                isPrivateBookcase.value = true;
                break;
              case "Not found":
                isUserNotExisting.value = true;
                break;
              default:
                console.error(e.error);
            }
          });
      }
    },
    loadBookcaseOptions = async () => {
      if (!bookcaseOptions.value) {
        await userBookcaseEvents
          .getBookcaseOptions(bookcaseUsername.value!)
          .then((response) => {
            bookcaseOptions.value = response;
          })
          .catch((e) => {
            console.error(e.error);
          });
      }
    },
    updateBookcaseOptions = async () => {
      await privateBookcaseEvents.setBookcaseOptions(bookcaseOptions.value!);
    },
    loadBookcaseOrder = async () => {
      if (!bookcaseOrder.value) {
        await userBookcaseEvents
          .getBookcaseOrder(bookcaseUsername.value!)
          .then((response) => {
            bookcaseOrder.value = response.publicationCodes;
          })
          .catch((e) => {
            console.error(e.error);
          });
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
