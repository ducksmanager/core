import type { Event } from "~dm-types/Event";

export default { namespaceEndpoint: "/events" }
;export type Events =  {


  getEvents: () => Event[]
}
