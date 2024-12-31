import type { AugmentedIssue } from "~dm-types/AugmentedIssue";
import type { AuthorWithUserRating } from "~dm-types/AuthorWithUserRating";
import type {
  CollectionUpdateMultipleIssues,
  CollectionUpdateSingleIssue,
} from "~dm-types/CollectionUpdate";
import type { EdgeWithStringCreationDate } from "~dm-types/EdgeWithStringCreationDate";
import type { EditSubscription } from "~dm-types/EditSubscription";
import type { InducksIssueQuotationSimple } from "~dm-types/InducksIssueQuotationSimple";
import type { TransactionResults } from "~dm-types/TransactionResults";
import type { UserForAccountForm } from "~dm-types/UserForAccountForm";
import type {
  authorUser,
  issue,
  purchase,
  requestedIssue,
  subscription,
  user,
  userOptionType,
  userPermission,
} from "~prisma-schemas/schemas/dm";
import type { Errorable } from "~socket.io-services";

export default { namespaceEndpoint: "/collection" }
;export type Events =  {


  emptyCollection: () => userPermission[]
  getCollectionPopularity: () => Record<string, number>
  getNotificationToken: (
    username: string) => Errorable<string, "Unauthorized" | "Error">
  getLastVisit: (
    ) => Errorable<string | null, "This user does not exist">,
    
  getLastPublishedEdges: (
    ) => EdgeWithStringCreationDate[]

  getIssues: (
    ) => {
      countByCountrycode: Record<string, number>;
      countByPublicationcode: Record<string, number>;
      publicationNames: Record<string, string>;
      issues: AugmentedIssue<issue & { issuecode: string }>[];
    }
  addOrChangeIssues: (
    data: CollectionUpdateMultipleIssues) => TransactionResults
  addOrChangeCopies: (
    data: CollectionUpdateSingleIssue) => TransactionResults

  createRequests: (
    issueIds: number[]) => Errorable<
        void,
        | "The provided issue IDs were not all found"
        | "Invalid issue ID list, NaN"
      >,
    
  deleteRequests: (issueId: number) => void;
  getRequests: (
    as: "buyer" | "seller") => requestedIssue[]

  getContactMethods: (
    sellerId: number) => Errorable<
        { discordId?: string; email?: string },
        "Invalid seller ID"
      >,
    

  getIssuesForSale: (
    ) => AugmentedIssue<issue & { issuecode: string }>[]

  getOption: (
    optionName: Required<userOptionType>) => string[]
  setOption: (
    optionName: userOptionType,
    optionValues: string[],
  ) => void;

  deletePurchase: (
    purchaseId: number) => Errorable<void, "Purchase not found">
  getPurchases: (Omit<purchase, "date"> & {
        date: string;
      })[],
  createPurchase: (
    date: string,
    description: string) => Errorable<void, "Purchase already exists">

  getSubscriptions: () => Omit<subscription, "startDate" | "endDate"> & {
        startDate: string;
        endDate: string;
      }[]

  createSubscription: (
    data: EditSubscription) => (
    id: number) => void

  getUser: (
    ) => Errorable<Omit<user, "password">, "User not found">,
    
  deleteUser: () => void;
  updateUser: (
    data: UserForAccountForm) => Errorable<
        {
          hasRequestedPresentationSentenceUpdate: boolean;
        },
        "Bad request"
      >,
    

  getWatchedAuthors: (
    ) => AuthorWithUserRating[]
  deleteWatchedAuthor: (
    personcode: string) => (
    data: authorUser) => Errorable<void, "Error">
  addWatchedAuthor: (
    personcode: string) => Errorable<void, "Error">

  getCollectionQuotations: (
    ) => Errorable<
        {
          quotations: Record<
            string,
            InducksIssueQuotationSimple & { estimationAverage: number }
          >;
        },
        "Bad request"
      >,
    
}
