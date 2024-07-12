import {
  PrismaClient,
  edge as rawEdge,
  issue as rawIssue,
  subscription as rawSubscription,
} from "../client_dm";
import { computeTimestamp } from "./dm.edge.timestamp";
import { computePublicationcode } from "./dm.publicationcode";
import { computeShortIssuecodeFromCountryMagazineIssuenumber } from "./shortIssuecode";

type myReturnType<FieldValue, T> = FieldValue extends string ? never : T;
declare global {
  interface Array<T> {
    groupBy<Key extends keyof T>(
      fieldName: Key,
      valueFieldName?: T[Key],
    ): { [key: string]: myReturnType<T[Key], T> };
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
      issue: {
        ...computePublicationcode,
        ...computeShortIssuecodeFromCountryMagazineIssuenumber,
      },
      subscription: computePublicationcode,
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

const publicationcodeAndIssueCodeComputes = {
  ...computePublicationcode,
  ...computeShortIssuecodeFromCountryMagazineIssuenumber,
};
export type issue = ExtendedType<
  rawIssue,
  typeof publicationcodeAndIssueCodeComputes
>;

export type subscription = ExtendedType<
  rawSubscription,
  typeof computePublicationcode
>;

export * from "../client_dm";
