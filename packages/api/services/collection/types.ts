import { EdgeWithStringCreationDate } from "~dm-types/EdgeWithStringCreationDate";
import { issuePopularity, userPermission } from "~prisma-clients/client_dm";

import { Errorable } from "../types";
import Issues from "./issues/types";
import Marketplace from "./marketplace/types";
import Options from "./options/types";
import Purchases from "./purchases/types";
import Subscriptions from "./subscriptions/types";
import User from "./user/types";
import WatchedAuthors from "./watched-authors/types";

export interface Services
  extends WatchedAuthors,
    Issues,
    User,
    Marketplace,
    Options,
    Purchases,
    Subscriptions,
    WatchedAuthors {
  emptyCollection: (callback: () => void) => void;
  getUserPermissions: (callback: (data: userPermission[]) => void) => void;
  getCollectionPopularity: (
    callback: (data: issuePopularity[]) => void
  ) => void;
  getNotificationToken: (
    username: string,
    callback: (token: Errorable<string, "Unauthorized" | "Error">) => void
  ) => void;
  getLastVisit: (
    callback: (
      value: Errorable<string | null, "This user does not exist">
    ) => void
  ) => void;
  getLastPublishedEdges: (
    callback: (value: EdgeWithStringCreationDate[]) => void
  ) => void;
}

export const NamespaceEndpoint = "/collection";
