import type { Event } from "~dm-types/Event";

export const namespaceEndpoint = "/events";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract getEvents: (callback: (value: Event[]) => void) => void;
}
