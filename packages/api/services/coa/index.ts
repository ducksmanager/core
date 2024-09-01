import type { Namespace, Server } from "socket.io";

import { prismaClient as prismaCoa } from "~prisma-schemas/schemas/coa/client";

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

const getInducksIssueData = (issuecodes: string[], withTitle: boolean) =>
  prismaCoa.inducks_issue
    .findMany({
      select: {
        publicationcode: true,
        issuenumber: true,
        issuecode: true,
        title: withTitle,
      },
      where: {
        issuecode: {
          in: issuecodes,
        },
      },
    })
    .then((inducksIssues) => inducksIssues.groupBy("issuecode"));

export const augmentIssueObjectWithInducksData = <
  Entity extends { issuecode: string },
>(
  issues: Record<string, Entity>,
  withTitle: boolean = false,
) =>
  getInducksIssueData(Object.keys(issues), withTitle).then((inducksIssues) =>
    Object.entries(issues).reduce<typeof issues>(
      (acc, [issuecode, issue]) => ({
        ...acc,
        [issuecode]: { ...issue, ...inducksIssues[issuecode] },
      }),
      {},
    ),
  );

export const augmentIssueArrayWithInducksData = async <
  Entity extends { issuecode: string },
>(
  issues: Entity[],
  withTitle: boolean = false,
) =>
  getInducksIssueData(
    [...new Set(issues.map(({ issuecode }) => issuecode))],
    withTitle,
  ).then((inducksIssues) =>
    issues.map((issue) => ({
      ...issue,
      ...inducksIssues[issue.issuecode],
    })),
  );
