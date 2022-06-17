import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async () =>
    (await fetch({ path: "/ducksmanager/bookstoreComment/list/active" })).data
);
