import type { BookstoreCommentEvent } from "./events/BookstoreCommentEvent";
import type { CollectionSubscriptionAdditionEvent } from "./events/CollectionSubscriptionAdditionEvent";
import type { CollectionUpdateEvent } from "./events/CollectionUpdateEvent";
import type { EdgeCreationEvent } from "./events/EdgeCreationEvent";
import type { MedalEvent } from "./events/MedalEvent";
import type { SignupEvent } from "./events/SignupEvent";

export type Event =
  | SignupEvent
  | CollectionUpdateEvent
  | CollectionSubscriptionAdditionEvent
  | BookstoreCommentEvent
  | EdgeCreationEvent
  | MedalEvent;
