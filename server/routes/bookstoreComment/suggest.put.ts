import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async (event) =>
    (
      await fetch({
        path: "/ducksmanager/bookstoreComment/suggest",
        parameters: await useBody(event),
        method: "POST",
      })
    ).data
);
