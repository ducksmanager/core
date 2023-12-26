
import { subscription } from "~prisma-clients/client_dm";

import { EditSubscription } from "../../../../types/EditSubscription";

export default interface User {
  getSubscriptions: (callback: (data: (Omit<subscription, "startDate" | "endDate"> & {
    publicationcode: string;
    startDate: string;
    endDate: string;
  })[]) => void) => void;

  createSubscription: (data: EditSubscription, callback: () => void) => void

  updateSubscription: (id: number, data: EditSubscription, callback: () => void) => void

  deleteSubscription: (id: number, callback: () => void) => void
}
