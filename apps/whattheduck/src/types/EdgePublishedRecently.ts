export interface EdgePublishedRecently {
  id: number;
  publicationcode: string;
  issuenumber: string;
  creationDate: string;
}

export interface EdgePublishedRecentlyWithTimestamp
  extends EdgePublishedRecently {
  timestamp: number;
}
