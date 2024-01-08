
import { CollectionUpdateMultipleIssues, CollectionUpdateSingleIssue } from "~dm-types/CollectionUpdate";
import { TransactionResults } from "~dm-types/TransactionResults";
import { issueWithPublicationcode } from "~prisma-clients/extended/dm.extends";

export default interface User {
  getIssues: (callback: (data: issueWithPublicationcode[]) => void) => void;
  addOrChangeIssues: (data: CollectionUpdateMultipleIssues, callback: (data: TransactionResults) => void) => void;
  addOrChangeCopies: (data: CollectionUpdateSingleIssue, callback: (data: TransactionResults) => void) => void;
}
