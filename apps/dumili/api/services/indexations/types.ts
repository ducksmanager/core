import type { Prisma } from "~prisma/client_dumili";
import type { Errorable } from "~socket.io-services/types";

export type IndexationWithFirstPage = Prisma.indexationGetPayload<{
  include: {
    pages: {
      take: 1;
      orderBy: {
        pageNumber: "asc";
      };
    };
  };
}>;

export default abstract class {
  static namespaceEndpoint: string = "/indexations";

  abstract createIfNotExists: (indexationId: string, callback: () => void) => void;

  abstract getIndexations: (
    callback: (
      data: Errorable<{ indexations: IndexationWithFirstPage[] }, "Error">,
    ) => void,
  ) => void;
}