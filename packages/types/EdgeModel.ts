import {
  edgeContributor,
  edgePhoto,
  elementImage,
} from "~prisma-schemas/client_edgecreator";

export type EdgeModel = {
  id: number;
  country: string;
  magazine: string;
  issuenumber: string;
  fileName?: string;
  username?: string | null;
  photos?: (edgePhoto & { elementImage: elementImage })[];
  contributors?: edgeContributor[];
  isEditor?: number;
};
