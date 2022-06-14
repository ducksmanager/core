import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async (event) =>
    (
      await fetch(
        `/global-stats/user/${event.context.params.ids}`,
        "ducksmanager"
      )
    ).data
);
