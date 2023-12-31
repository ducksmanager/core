import { Event } from "~dm-types/Event";

export interface Services {
  getEvents: (callback: (value: Event[]) => void) => void;
}

export const NamespaceEndpoint = "/events";
