import { AbstractEvent } from "~types/events/AbstractEvent";

export class BookstoreCreationEvent extends AbstractEvent {
  type = "bookstore_comment";
  name: string | undefined = undefined;
}
