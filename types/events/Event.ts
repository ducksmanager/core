import { BookstoreCommentEvent } from "./BookstoreCommentEvent";
import { CollectionSubscriptionAdditionEvent } from "./CollectionSubscriptionAdditionEvent";
import { CollectionUpdateEvent } from "./CollectionUpdateEvent";
import { EdgeCreationEvent } from "./EdgeCreationEvent";
import { MedalEvent } from "./MedalEvent";
import { SignupEvent } from "./SignupEvent";

export type Event =
  | SignupEvent
  | CollectionUpdateEvent
  | CollectionSubscriptionAdditionEvent
  | BookstoreCommentEvent
  | EdgeCreationEvent
  | MedalEvent;
