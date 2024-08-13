import type { edge as rawEdge, PrismaClient } from "../../../client_dm";
import { computeTimestamp } from "./edge.timestamp";

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
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
