import "~group-by";
import {
  type inducks_issue as rawInducksIssue,
  type PrismaClient,
} from "../../../client_coa/client";
import {
  computeIssuenumber,
  computePublicationcode,
} from "./overrideNullableCodes";

type Augmented = {
  issuecode: string;
  publicationcode: string;
  issuenumber: string;
};

export type ExtraSelectField = Exclude<keyof rawInducksIssue, keyof Augmented>;

export default (prismaClient: PrismaClient) =>
  prismaClient
    .$extends({
      result: {
        inducks_issue: {
          ...computePublicationcode,
          ...computeIssuenumber,
        },
      },
    })
    .$extends({
      client: {
        getInducksIssueData: <WithTitle extends boolean>(
          issuecodes: string[],
          withTitle: WithTitle,
        ) =>
          !issuecodes.filter(Boolean).length
            ? ({} as Record<string, never>)
            : prismaClient.inducks_issue
                .findMany({
                  select: {
                    publicationcode: true,
                    issuenumber: true,
                    issuecode: true,
                    title: withTitle,
                  },
                  where: {
                    issuecode: {
                      in: issuecodes.filter(Boolean),
                    },
                  },
                })
                .then((inducksIssues) =>
                  (
                    inducksIssues as ({
                      publicationcode: string;
                      issuenumber: string;
                      issuecode: string;
                    } & (WithTitle extends boolean
                      ? {
                          title?: string;
                        }
                      : object))[]
                  ).groupBy("issuecode"),
                ),
        augmentIssueArrayWithInducksData: async function <
          Entity extends { issuecode: string },
          SelectFields extends ExtraSelectField[] = [],
        >(
          issues: Entity[],
          selectFields: SelectFields = [] as unknown as SelectFields,
        ) {
          const issuecodes = [
            ...new Set(
              issues.map(({ issuecode }) => issuecode).filter(Boolean),
            ),
          ];
          if (!issuecodes.length) return [];

          const inducksIssues = await prismaClient.inducks_issue
            .findMany({
              select: {
                publicationcode: true,
                issuenumber: true,
                issuecode: true,
                ...Object.fromEntries(
                  selectFields.map((field) => [field, true]),
                ),
              },
              where: {
                issuecode: {
                  in: issuecodes,
                },
              },
            })
            .then((issues) => issues.groupBy("issuecode"));

          return issues.map((issue) => ({
            ...issue,
            ...(inducksIssues[issue.issuecode] as Augmented &
              Pick<rawInducksIssue, (typeof selectFields)[number]>),
          }));
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

export * from "../../../client_coa/client";
