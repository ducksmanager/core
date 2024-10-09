import type { edge as rawEdge, PrismaClient } from "../../../client_dm";
import { computeTimestamp } from "./edge.timestamp";

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    query: {
      issue: {
        create({ args, query }) {
          if (!args.data.country) {
            const [publicationcode, issuenumber] =
              args.data.issuecode!.split(/[ ]+/);
            const [country, magazine] = publicationcode.split("/");
            args.data.country = country;
            args.data.magazine = magazine;
            args.data.issuenumber = issuenumber;
          }
          return query(args);
        },
        upsert({ args, query }) {
          if (!args.create.country) {
            const [publicationcode, issuenumber] =
              args.create.issuecode!.split(/[ ]+/);
            const [country, magazine] = publicationcode.split("/");
            args.create.country = country;
            args.create.magazine = magazine;
            args.create.issuenumber = issuenumber;
          }
          return query(args);
        },
      },
    },
    result: {
      edge: computeTimestamp,
    },
  });

type ExtendedType<
  BaseType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Compute extends { [key: string]: { compute: (...args: any[]) => any } },
> = BaseType & {
  [Key in keyof Compute]: ReturnType<Compute[Key]["compute"]>;
};

export type edge = ExtendedType<rawEdge, typeof computeTimestamp>;

export * from "../../../client_dm";
