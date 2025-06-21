import { AbstractEvent } from "./AbstractEvent";

export class BookstoreCommentEvent extends AbstractEvent {
  type = "bookstore_comment";
  name!: string;
}
