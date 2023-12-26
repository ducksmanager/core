
import { Errorable } from "~/services/types";
import { purchase } from "~prisma-clients/client_dm";

export default interface User {
  deletePurchase: (purchaseId: number, callback: (data: Errorable<void, 'Purchase not found'>) => void) => void;
  getPurchases: (callback: (data: (Omit<purchase, "date"> & {
    date: string;
  })[]) => void) => void;
  createPurchase: (date: string, description: string, callback: (data: Errorable<void, 'Purchase already exists'>) => void) => void;
}
