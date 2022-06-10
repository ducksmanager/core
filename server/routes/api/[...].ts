import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async (event) =>
    (await fetch(`/${event.context.params._}`, "coa", {}, event.context.method))
      .data
);
