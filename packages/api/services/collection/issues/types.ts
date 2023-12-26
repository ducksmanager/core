
import { CollectionUpdateMultipleIssues, CollectionUpdateSingleIssue } from "~dm-types/CollectionUpdate";
import { TransactionResults } from "~dm-types/TransactionResults";
import { issue } from "~prisma-clients/client_dm";

export default interface User {
  getIssues: (callback: (data: issue[]) => void) => void;
  addOrChangeIssues: (data: CollectionUpdateMultipleIssues, callback: (data: TransactionResults) => void) => void;
  addOrChangeCopies: (data: CollectionUpdateSingleIssue, callback: (data: TransactionResults) => void) => void;
}
