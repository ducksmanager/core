import type { dataset } from "../prisma/client_duckguessr/client";

export interface DatasetWithCounts extends dataset {
  images: number;
  authors: number;
}
