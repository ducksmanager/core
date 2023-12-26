
import { EdgeWithStringCreationDate } from "~dm-types/EdgeWithStringCreationDate";
import { issuePopularity, userPermission } from "~prisma-clients/client_dm";

import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";
import Issues from "./issues/types";
import Marketplace from "./marketplace/types";
import Options from "./options/types";
import Purchases from "./purchases/types";
import Subscriptions from "./subscriptions/types";
import User from "./user/types";
import WatchedAuthors from "./watched-authors/types";

export interface Services
  extends WatchedAuthors, Issues, User, Marketplace, Options, Purchases, Subscriptions {

  emptyCollection: (callback: () => void) => void;
  getUserPermissions: (callback: (data: userPermission[]) => void) => void;
  getCollectionPopularity: (callback: (data: issuePopularity[]) => void) => void;
  getNotificationToken: (username: string, callback: (token: Errorable<string, 'Unauthorized' | 'Error'>) => void) => void;
  getLastVisit: (callback: (value: Errorable<Date | null, 'This user does not exist'>) => void) => void;
  getLastPublishedEdges: (callback: (value: EdgeWithStringCreationDate[]) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
  public static endpoint = '/collection'
}
