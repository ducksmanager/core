import type { edge as rawEdge, PrismaClient } from "../../../client_dm/client";
import { computeTimestamp } from "./edge.timestamp";

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    client: {
      replaceLabelsWithLabelIds: <
        T,
        Entity extends T & { labels: { labelId: number }[] },
      >(
        issues: Entity[],
      ): (Omit<Entity, "labels"> & { labelIds: number[] })[] =>
        issues.map(({ labels, ...issue }) => ({
          ...issue,
          labelIds: labels.map(({ labelId }) => labelId),
        })),
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

export * from "../../../client_dm/client";
