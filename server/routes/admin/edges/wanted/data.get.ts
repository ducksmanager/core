import { fetch } from "~/server/fetch";

export default defineEventHandler(
  async () => (await fetch("/edges/wanted", "ducksmanager")).data
);
