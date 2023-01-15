import { AbstractEvent } from "~types/events/AbstractEvent";

export class CollectionUpdateEventRaw {
  type = "collection_update";
  numberOfIssues = 0;
  exampleIssue = "";
  timestamp = 0;
}

export class CollectionUpdateEvent extends AbstractEvent {
  type = "collection_update";
  numberOfIssues!: number;
  publicationcode!: string;
  issuenumber!: string;
}
