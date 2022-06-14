import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async () => (await fetch("/ducksmanager/users/count", "ducksmanager")).data
);
