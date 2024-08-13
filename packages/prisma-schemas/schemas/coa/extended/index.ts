import type {
  inducks_issue as rawInducksIssue,
  PrismaClient,
} from "../../../client_coa";
import {
  computeIssuenumber,
  computePublicationcode,
} from "./overrideNullableCodes";

export default (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    result: {
      inducks_issue: {
        ...computePublicationcode,
        ...computeIssuenumber,
      },
    },
  });

type ExtendedType<
  BaseType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Compute extends { [key: string]: { compute: (...args: any[]) => any } },
> = Omit<BaseType, keyof Compute> & {
  [Key in keyof Compute]: ReturnType<Compute[Key]["compute"]>;
};

type inducksIssueWithNonNullablePublicationcode = ExtendedType<
  rawInducksIssue,
  typeof computePublicationcode
>;
type inducksIssueWithNonNullableIssuenumber = ExtendedType<
  Omit<inducksIssueWithNonNullablePublicationcode, "issuenumber">,
  typeof computeIssuenumber
>;

export type inducks_issue = inducksIssueWithNonNullableIssuenumber;

export * from "../../../client_coa";
