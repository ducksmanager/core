import { Namespace, Server } from "socket.io";

import authors from "./authors";
import countries from "./countries";
import issueDetails from "./issue-details";
import issues from "./issues";
import publications from "./publications";
import quotations from "./quotations";
import stories from "./stories";
import Services from "./types";

export default (io: Server) => {
  (io.of(Services.namespaceEndpoint) as Namespace<Services>).on("connection", (socket) => {
    countries(socket);
    publications(socket);
    issues(socket);
    issueDetails(socket);
    authors(socket);
    quotations(socket);
    stories(socket);
  });
};
