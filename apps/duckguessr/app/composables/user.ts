import { useCookies } from "@vueuse/integrations/useCookies";

export const getDuckguessrId = () =>
  parseInt(useCookies().getAll()["duckguessr-id"]);

export const getDuckguessrUsername = () =>
  useCookies().getAll()["duckguessr-user"];

export const isBot = (username: string) => /^bot_/.test(username);
export const isPotentialBot = (username: string) =>
  username === "potential_bot";

export const getShownUsername = (username: string) =>
  isBot(username) ? "BOT" : username;

export default () => {};
