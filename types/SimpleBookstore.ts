import { bookstoreComment } from "~prisma_clients/client_dm";

export interface SimpleBookstore {
  id: number;
  name: string;
  address: string;
  coordX: number;
  coordY: number;
  comments: bookstoreComment[];
}
