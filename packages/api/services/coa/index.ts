import { Namespace, Server } from "socket.io";

import authors from "./authors";
import countries from "./countries";
import issueDetails from "./issue-details";
import issues from "./issues";
import publications from "./publications";
import quotations from "./quotations";
import { CoaServices } from "./types";
export default (io: Server) => {
  (io.of("/coa") as Namespace<CoaServices>).on("connection", (socket) => {
    countries(socket);
    publications(socket);
    issues(socket);
    issueDetails(socket);
    authors(socket);
    quotations(socket);
  });
};
