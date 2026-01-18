export interface SimpleBookstoreComment {
  comment: string;
  userId: number | null;
  creationDate: Date | string | null;
}

export interface SimpleBookstore {
  id: number;
  name: string;
  address: string;
  coordX: number;
  coordY: number;
  reportedAsClosed: Date | null;
  comments: SimpleBookstoreComment[];
}
export type NewBookstore = Pick<
  SimpleBookstore,
  "name" | "address" | "coordX" | "coordY"
>;

export type NewComment = {
  comment: string;
  atmosphereRating: number;
  pricesRating: number;
  selectionRating: number;

};
