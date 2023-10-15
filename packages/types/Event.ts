import { BookstoreCommentEvent } from "./events/BookstoreCommentEvent";
import { CollectionSubscriptionAdditionEvent } from "./events/CollectionSubscriptionAdditionEvent";
import { CollectionUpdateEvent } from "./events/CollectionUpdateEvent";
import { EdgeCreationEvent } from "./events/EdgeCreationEvent";
import { MedalEvent } from "./events/MedalEvent";
import { SignupEvent } from "./events/SignupEvent";

export type Event =
  | SignupEvent
  | CollectionUpdateEvent
  | CollectionSubscriptionAdditionEvent
  | BookstoreCommentEvent
  | EdgeCreationEvent
  | MedalEvent;
