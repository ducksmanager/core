import Index from '@prisma/client'
export interface DatasetWithCounts extends Index.dataset {
  images: number
  authors: number
}
