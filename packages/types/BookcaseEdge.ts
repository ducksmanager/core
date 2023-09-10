export interface BookcaseEdgeSprite {
  name: string;
  version: string;
  size: number;
}

export interface BookcaseEdge {
  id: number;
  countryCode: string;
  magazineCode: string;
  publicationcode: string;
  issuenumber: string;
  issuenumberReference: string;
  edgeId: number;
  creationDate: Date;
  sprites: BookcaseEdgeSprite[];
}
