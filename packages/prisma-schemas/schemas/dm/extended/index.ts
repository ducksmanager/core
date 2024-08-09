import { PrismaClient, edge as rawEdge } from "../../../client_dm";
import { computeTimestamp } from "./edge.timestamp";

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    result: {
      edge: computeTimestamp,
    },
  });

type ExtendedType<
  BaseType,
  Compute extends { [key: string]: { compute: (...args: any[]) => any } },
> = BaseType & {
  [Key in keyof Compute]: ReturnType<Compute[Key]["compute"]>;
};

export type edge = ExtendedType<rawEdge, typeof computeTimestamp>;

export * from "../../../client_dm";
