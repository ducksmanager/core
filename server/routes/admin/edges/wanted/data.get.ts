import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async () => (await fetch({ path: "/edges/wanted" })).data
);
