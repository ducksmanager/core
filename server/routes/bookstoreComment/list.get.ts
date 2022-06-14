import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async () =>
    (await fetch("/ducksmanager/bookstoreComment/list/active", "ducksmanager"))
      .data
);
