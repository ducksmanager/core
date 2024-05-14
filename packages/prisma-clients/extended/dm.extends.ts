import { edge, issue, subscription } from "../client_dm";
import { prismaDm } from "../prisma";
import { computeTimestamp } from "./dm.edge.timestamp";
import { computePublicationcode } from "./dm.publicationcode";

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

export default prismaDm.$extends({
  result: {
    issue: computePublicationcode,
    subscription: computePublicationcode,
    edge: computeTimestamp,
  },
});

type ExtendedType<
  T,
  FieldName extends keyof Compute,
  Compute extends Record<FieldName, { compute: (...args: any) => any }>,
> = T & {
  [K in FieldName]: ReturnType<Compute[K]["compute"]>;
};

export type edgeWithTimestamp = ExtendedType<
  edge,
  "timestamp",
  typeof computeTimestamp
>;
export type issueWithPublicationcode = ExtendedType<
  issue,
  "publicationcode",
  typeof computePublicationcode
>;
export type subscriptionWithPublicationcode = ExtendedType<
  subscription,
  "publicationcode",
  typeof computePublicationcode
>;
