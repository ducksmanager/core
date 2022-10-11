import { AbstractEvent } from "~types/events/AbstractEvent";

export interface CollectionSubscriptionAdditionEventRaw {
  type: string;
  publicationCode: string;
  issueNumber: string;
  users: string;
  timestamp: number;
}

export class CollectionSubscriptionAdditionEvent extends AbstractEvent {
  type = "subscription_additions";
  publicationCode: string | undefined = undefined;
  issueNumber: string | undefined = undefined;
}
