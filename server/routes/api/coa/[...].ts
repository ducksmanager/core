import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async (event) =>
    (
      await fetch({
        path: `/coa/${event.context.params._}`,
        role: "coa",
        method: event.context.method,
      })
    ).data
);
