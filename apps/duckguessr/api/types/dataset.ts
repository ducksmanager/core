import type { dataset } from "../prisma/client_duckguessr/browser";

export interface DatasetWithCounts extends dataset {
  images: number;
  authors: number;
}
