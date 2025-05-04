import "~group-by";
import {
  type inducks_issue as rawInducksIssue,
  type PrismaClient,
} from "../../../client_coa";
import {
  computeIssuenumber,
  computePublicationcode,
} from "./overrideNullableCodes";

type Augmented = { issuecode: string; publicationcode: string ; issuenumber: string ; title: string | null; }

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
        augmentIssueArrayWithInducksData: async function <
          Entity extends { issuecode: string },
        >(issues: Entity[], withTitle: boolean = false): Promise<(Entity & Augmented)[]> {
          const issuecodes = [...new Set(issues.map(({ issuecode }) => issuecode))];
          if (!issuecodes.length) return [];

          const inducksIssues = await prismaClient.inducks_issue.findMany({
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
          }).then(issues => issues.groupBy("issuecode"));

          return issues.map((issue) => ({
            ...issue,
            ...inducksIssues[issue.issuecode] as Augmented,
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
