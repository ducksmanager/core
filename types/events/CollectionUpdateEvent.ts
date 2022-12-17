import { AbstractEvent } from "~types/events/AbstractEvent";

export class CollectionUpdateEventRaw {
  type = "collection_update";
  numberOfIssues = 0;
  exampleIssue = "";
  timestamp = 0;
}

export class CollectionUpdateEvent extends AbstractEvent {
  type = "collection_update";
  numberOfIssues: number | undefined = undefined;
  publicationcode: string | undefined = undefined;
  issuenumber: string | undefined = undefined;
}
