export interface BookcaseEdgeSprite {
  name: string;
  version: string;
  size: number;
}

export interface BookcaseEdge {
  id: number;
  publicationcode: string;
  shortIssuenumber: string;
  shortIssuecode: string;
  issuenumberReference: string;
  edgeId: number;
  creationDate: Date;
  sprites: BookcaseEdgeSprite[];
}
