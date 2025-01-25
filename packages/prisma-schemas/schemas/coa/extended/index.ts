import "~group-by";
import {
  type inducks_issue as rawInducksIssue,
  type PrismaClient,
  Prisma,
} from "../../../client_coa";
import {
  computeIssuenumber,
  computePublicationcode,
} from "./overrideNullableCodes";

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
          !issuecodes.length
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
                      in: issuecodes,
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
      },
    })
    .$extends({
      client: {
        augmentIssueArrayWithInducksData: async function <
          Entity extends { issuecode: string },
        >(issues: Entity[], withTitle: boolean = false) {
          const inducksIssues = await Prisma.getExtensionContext(
            this,
          ).getInducksIssueData(
            [...new Set(issues.map(({ issuecode }) => issuecode))],
            withTitle,
          );
          return issues.map((issue) => ({
            ...issue,
            ...inducksIssues[issue.issuecode],
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

export * from "../../../client_coa";
