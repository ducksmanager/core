import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async (event) =>
    (
      await fetch(
        "/ducksmanager/bookstoreComment/suggest",
        "ducksmanager",
        await useBody(event),
        "POST"
      )
    ).data
);
