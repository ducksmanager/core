export interface SimpleBookstoreComment {
  comment: string;
  userId: number | null;
  creationDate: Date | null;
}

export interface SimpleBookstore {
  id: number | null;
  name: string;
  address: string;
  coordX: number;
  coordY: number;
  comments: SimpleBookstoreComment[];
}
