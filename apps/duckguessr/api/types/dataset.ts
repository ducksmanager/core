import { dataset } from "../prisma/client_duckguessr";

export interface DatasetWithCounts extends dataset {
  images: number
  authors: number
}
