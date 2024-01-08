
import { EditSubscription } from "~dm-types/EditSubscription";
import { subscriptionWithPublicationcode } from "~prisma-clients/extended/dm.extends";

export default interface User {
  getSubscriptions: (callback: (data: (Omit<subscriptionWithPublicationcode, "startDate" | "endDate"> & {
    startDate: string;
    endDate: string;
  })[]) => void) => void;

  createSubscription: (data: EditSubscription, callback: () => void) => void

  updateSubscription: (id: number, data: EditSubscription, callback: () => void) => void

  deleteSubscription: (id: number, callback: () => void) => void
}
