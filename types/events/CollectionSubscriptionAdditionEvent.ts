import { AbstractEvent } from "~types/events/AbstractEvent";

export interface CollectionSubscriptionAdditionEventRaw {
  type: string;
  publicationcode: string;
  issuenumber: string;
  users: string;
  timestamp: number;
}

export class CollectionSubscriptionAdditionEvent extends AbstractEvent {
  type = "subscription_additions";
  publicationcode: string | undefined = undefined;
  issuenumber: string | undefined = undefined;
}
