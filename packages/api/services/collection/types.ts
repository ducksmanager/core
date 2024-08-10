import type { AugmentedIssue } from "~dm-types/AugmentedIssue";
import type { AuthorWithUserRating } from "~dm-types/AuthorWithUserRating";
import type {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";
import type { EdgeWithStringCreationDate } from "~dm-types/EdgeWithStringCreationDate";
import type { EditSubscription } from "~dm-types/EditSubscription";
import type { TransactionResults } from "~dm-types/TransactionResults";
import type { UserForAccountForm } from "~dm-types/UserForAccountForm";
import type { inducks_issuequotation } from "~prisma-schemas/schemas/coa";
import type {
  authorUser,
  issue,
  issuePopularity,
  purchase,
  requestedIssue,
  subscription,
  user,
  userOptionType,
  userPermission,
} from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services/types";

export const namespaceEndpoint = "/collection";
export default abstract class {
  static namespaceEndpoint = namespaceEndpoint;

  abstract emptyCollection: (callback: () => void) => void;
  abstract getUserPermissions: (
    callback: (data: userPermission[]) => void,
  ) => void;
  abstract getCollectionPopularity: (
    callback: (data: issuePopularity[]) => void,
  ) => void;
  abstract getNotificationToken: (
    username: string,
    callback: (token: Errorable<string, "Unauthorized" | "Error">) => void,
  ) => void;
  abstract getLastVisit: (
    callback: (
      value: Errorable<string | null, "This user does not exist">,
    ) => void,
  ) => void;
  abstract getLastPublishedEdges: (
    callback: (value: EdgeWithStringCreationDate[]) => void,
  ) => void;

  abstract getIssues: (
    callback: (data: (AugmentedIssue<(issue & { issuecode: string })>)[]) => void,
  ) => void;
  abstract addOrChangeIssues: (
    data: CollectionUpdateMultipleIssues,
    callback: (data: TransactionResults) => void,
  ) => void;
  abstract addOrChangeCopies: (
    data: CollectionUpdateSingleIssue,
    callback: (data: TransactionResults) => void,
  ) => void;

  abstract getPublicationTitles: (
    callback: (value: Record<string, string>) => void,
  ) => void;

  abstract getCoaCountByPublicationcode: (
    callback: (value: Record<string, number>) => void,
  ) => void;

  abstract getCoaCountByCountrycode: (
    callback: (value: Record<string, number>) => void,
  ) => void;

  abstract createRequests: (
    issueIds: number[],
    callback: (
      value: Errorable<
        void,
        | "The provided issue IDs were not all found"
        | "Invalid issue ID list, NaN"
      >,
    ) => void,
  ) => void;
  abstract deleteRequests: (issueId: number, callback: () => void) => void;
  abstract getRequests: (
    as: "buyer" | "seller",
    callback: (data: requestedIssue[]) => void,
  ) => void;

  abstract getContactMethods: (
    sellerId: number,
    callback: (
      data: Errorable<
        { discordId?: string; email?: string },
        "Invalid seller ID"
      >,
    ) => void,
  ) => void;

  abstract getIssuesForSale: (
    callback: (data: (AugmentedIssue<issue & { issuecode: string }>)[]) => void,
  ) => void;

  abstract getOption: (
    optionName: Required<userOptionType>,
    callback: (value: string[]) => void,
  ) => void;
  abstract setOption: (
    optionName: userOptionType,
    optionValues: string[],
    callback: () => void,
  ) => void;

  abstract deletePurchase: (
    purchaseId: number,
    callback: (data: Errorable<void, "Purchase not found">) => void,
  ) => void;
  abstract getPurchases: (
    callback: (
      data: (Omit<purchase, "date"> & {
        date: string;
      })[],
    ) => void,
  ) => void;
  abstract createPurchase: (
    date: string,
    description: string,
    callback: (data: Errorable<void, "Purchase already exists">) => void,
  ) => void;

  abstract getSubscriptions: (
    callback: (
      data: (Omit<subscription, "startDate" | "endDate"> & {
        startDate: string;
        endDate: string;
      })[],
    ) => void,
  ) => void;

  abstract createSubscription: (
    data: EditSubscription,
    callback: () => void,
  ) => void;

  abstract updateSubscription: (
    id: number,
    data: EditSubscription,
    callback: () => void,
  ) => void;

  abstract deleteSubscription: (id: number, callback: () => void) => void;

  abstract getUser: (
    callback: (
      data: Errorable<Omit<user, "password">, "User not found">,
    ) => void,
  ) => void;
  abstract deleteUser: (callback: () => void) => void;
  abstract updateUser: (
    data: UserForAccountForm,
    callback: (
      data: Errorable<
        {
          hasRequestedPresentationSentenceUpdate: boolean;
        },
        "Bad request"
      >,
    ) => void,
  ) => void;
  abstract createUser: (
    data: {
      username: string;
      password: string;
      email: string;
    } & Record<string, unknown>,
    callback: (data: Errorable<{ token: string }, "Bad request">) => void,
  ) => void;

  abstract getWatchedAuthors: (callback: (value: AuthorWithUserRating[]) => void) => void;
  abstract deleteWatchedAuthor: (
    personcode: string,
    callback: () => void,
  ) => void;
  abstract updateWatchedAuthor: (
    data: authorUser,
    callback: (value: Errorable<void, "Error">) => void,
  ) => void;
  abstract addWatchedAuthor: (
    personcode: string,
    callback: (value: Errorable<void, "Error">) => void,
  ) => void;

  abstract getCollectionQuotations: (
    callback: (
      value: Errorable<
        { quotations: Record<string, inducks_issuequotation> },
        "Bad request"
      >,
    ) => void,
  ) => void;
}
