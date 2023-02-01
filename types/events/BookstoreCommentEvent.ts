import { AbstractEvent } from "~types/events/AbstractEvent";

export class BookstoreCommentEvent extends AbstractEvent {
  type = "bookstore_comment";
  name!: string;
}
