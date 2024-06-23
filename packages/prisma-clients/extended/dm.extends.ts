import { PrismaClient, edge as rawEdge, issue as rawIssue, subscription as rawSubscription } from "../client_dm";
import { computeTimestamp } from "./dm.edge.timestamp";
import { computePublicationcode } from "./dm.publicationcode";
import { computeIssuecode } from "./dm.issuecode";

type myReturnType<FieldValue, T> = FieldValue extends string ? never : T;
declare global {
  interface Array<T> {
    groupBy<FieldValue>(
      fieldName: string,
      valueFieldName?: FieldValue,
    ): { [key: string]: myReturnType<FieldValue, T> };
  }
}

Array.prototype.groupBy = function (fieldName, valueFieldName?) {
  return this.reduce(
    (acc, object) => ({
      ...acc,
      [object[fieldName]]: valueFieldName
        ? object[valueFieldName] || undefined
        : object,
    }),
    {},
  );
};

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    result: {
      issue: { ...computePublicationcode, ...computeIssuecode },
      subscription: computePublicationcode,
      edge: computeTimestamp,
    },
  });


type ExtendedType<
  BaseType,
  Compute extends { [key: string]: { compute: (...args: any[]) => any } },
> = BaseType & {
  [Key in keyof Compute]: ReturnType<Compute[Key]['compute']>;
};

export type edge = ExtendedType<
  rawEdge,
  typeof computeTimestamp
>;

const publicationcodeAndIssueCodeComputes = { ...computePublicationcode, ...computeIssuecode }
export type issue = ExtendedType<
  rawIssue,
  typeof publicationcodeAndIssueCodeComputes
>;

export type subscription = ExtendedType<
  rawSubscription,
  typeof computePublicationcode
>;

export * from "../client_dm";
