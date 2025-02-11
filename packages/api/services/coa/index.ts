import { useSocketEvents } from "socket-call-server";

import namespaces from "../namespaces";
import authors from "./authors";
import countries from "./countries";
import issueDetails from "./issue-details";
import issues from "./issues";
import publications from "./publications";
import quotations from "./quotations";
import stories from "./stories";

const listenEvents = () => ({
  ...countries,
  ...publications,
  ...issues,
  ...issueDetails,
  ...authors,
  ...quotations,
  ...stories,
});

export const { client, server } = useSocketEvents<typeof listenEvents>(
  namespaces.COA,
  {
    listenEvents,
    middlewares: [],
  },
);

export type ClientEvents = (typeof client)["emitEvents"];
