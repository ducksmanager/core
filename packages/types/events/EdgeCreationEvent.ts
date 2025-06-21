import { AbstractEvent } from "./AbstractEvent";

export interface EdgeCreationEventRaw {
  type: string;
  issuecodes: string;
  timestamp: number;
  users: string;
}

export class EdgeCreationEvent extends AbstractEvent {
  type = "edge";
  issuecodes: string[] = [];
}
