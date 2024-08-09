import { AbstractEvent } from "./AbstractEvent";

export interface CollectionSubscriptionAdditionEventRaw {
  type: string;
  issuecode: string;
  users: string;
  timestamp: number;
}

export class CollectionSubscriptionAdditionEvent extends AbstractEvent {
  type = "subscription_additions";
  issuecode!: string;
}
