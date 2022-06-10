import { runQuery } from "~/server/fetch";

export default defineEventHandler(
  async () =>
    (
      await runQuery(
        "SELECT publicationcode, issuenumber FROM tranches_pretes",
        "dm"
      )
    ).data
);
