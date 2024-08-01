import type { Namespace, Server } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-clients/schemas/coa";

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


export const augmentIssuesWithInducksData = async <T extends {issuecode: string}>(issues: Record<string, T>) =>
  (
    await prismaCoa.inducks_issue.findMany({
      select: {
        publicationcode: true,
        issuenumber: true,
        issuecode: true,
      },
      where: {
        issuecode: {
          in: Object.keys(issues),
        },
      },
    })
  ).map((issue) => ({
    ...issue,
    ...(issues[issue.issuecode] as T),
  }));