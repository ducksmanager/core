import { Prisma } from "~/prisma/client_dumili";

export const indexationWithFirstPageAndAcceptedIssueSuggestion = {
  pages: {
    take: 1,
    orderBy: {
      pageNumber: "asc",
    },
  },
  acceptedIssueSuggestion: true,
} as const;


export type IndexationWithFirstPageAndAcceptedIssueSuggestion = Prisma.indexationGetPayload<{
  include: typeof indexationWithFirstPageAndAcceptedIssueSuggestion
}>;

export default abstract class {
  static namespaceEndpoint: string = "/indexations";

  abstract create: (indexationId: string, numberofPages: number, callback: () => void) => void;

  abstract getIndexations: (
    callback: (
      data: IndexationWithFirstPageAndAcceptedIssueSuggestion[],
    ) => void,
  ) => void;
}
