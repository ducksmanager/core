import { AbstractEvent } from "./AbstractEvent";

export interface CollectionSubscriptionAdditionEventRaw {
  type: string;
  publicationcode: string;
  shortIssuenumber: string;
  users: string;
  timestamp: number;
}

export class CollectionSubscriptionAdditionEvent extends AbstractEvent {
  type = "subscription_additions";
  publicationcode!: string;
  shortIssuenumber!: string;
}
