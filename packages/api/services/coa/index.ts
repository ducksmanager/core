import type { Namespace, Server } from "socket.io";


import authors from "./authors";
import countries from "./countries";
import issueDetails from "./issue-details";
import issues from "./issues";
import publications from "./publications";
import quotations from "./quotations";
import stories from "./stories";
import type Events from "./types";
import { namespaceEndpoint } from "./types";
export default (io: Server) => {
  (io.of(namespaceEndpoint) as Namespace<Events>).on("connection", (socket) => {
    console.log("connected to coa");

    countries(socket);
    publications(socket);
    issues(socket);
    issueDetails(socket);
    authors(socket);
    quotations(socket);
    stories(socket);
  });
};
