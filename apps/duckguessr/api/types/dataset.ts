import { dataset } from '@prisma/client'

export interface DatasetWithCounts extends dataset {
  images: number
  authors: number
}
