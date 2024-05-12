import type { Event } from "~dm-types/Event";

export default abstract class {
  static namespaceEndpoint = "/events";

  abstract getEvents: (callback: (value: Event[]) => void) => void;
}

