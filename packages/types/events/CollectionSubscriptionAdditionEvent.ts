import { AbstractEvent } from "./AbstractEvent";

export interface CollectionSubscriptionAdditionEventRaw {
  type: string;
  publicationcode: string;
  issuenumber: string;
  users: string;
  timestamp: number;
}

export class CollectionSubscriptionAdditionEvent extends AbstractEvent {
  type = "subscription_additions";
  publicationcode!: string;
  issuenumber!: string;
}
