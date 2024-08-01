import { AbstractEvent } from "./AbstractEvent";

export interface EdgeCreationEventRaw {
  type: string;
  edges: string;
  timestamp: number;
  users: string;
}

export class EdgeCreationEvent extends AbstractEvent {
  type = "edge";
  edges: { issuecode: string }[] = [];
}
