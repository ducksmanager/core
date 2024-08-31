import { AbstractEvent } from "./AbstractEvent";

export class CollectionUpdateEventRaw {
  type = "collection_update";
  numberOfIssues!: number;
  userId!: number
  timestamp!: number;
  exampleIssuecode!: string;
  issuecode!: string;
}

export class CollectionUpdateEvent extends AbstractEvent {
  type = "collection_update";
  numberOfIssues!: number;
  exampleIssuecode!: string;
  issuecode!: string;
}
