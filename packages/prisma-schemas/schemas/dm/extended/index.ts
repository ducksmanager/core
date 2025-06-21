import type { edge as rawEdge, PrismaClient } from "../../../client_dm";
import { computeTimestamp } from "./edge.timestamp";

const parseIssueCode = (issuecode: string) => {
  let splitPos = issuecode.indexOf(" ");
  if (splitPos === -1) {
    const firstDigitMatch = issuecode.match(/\d/);
    splitPos = issuecode.indexOf(firstDigitMatch![0]);
  }

  const publicationcode = issuecode.slice(0, splitPos);
  const issuenumber = issuecode.slice(splitPos).trimStart();
  const [country, magazine] = publicationcode.split("/");

  return { country, magazine, issuenumber };
};

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    query: {
      issue: {
        create({ args, query }) {
          if (!args.data.country && args.data.issuecode) {
            const { country, magazine, issuenumber } = parseIssueCode(
              args.data.issuecode,
            );
            args.data.country = country;
            args.data.magazine = magazine;
            args.data.issuenumber = issuenumber;
          }
          return query(args);
        },
        upsert({ args, query }) {
          if (!args.create.country && args.create.issuecode) {
            const { country, magazine, issuenumber } = parseIssueCode(
              args.create.issuecode,
            );
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
