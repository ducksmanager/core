import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async (event) =>
    (
      await fetch({
        path: `/global-stats/user/${event.context.params.ids}`,
      })
    ).data
);
