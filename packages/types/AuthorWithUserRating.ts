import { inducks_person } from "~prisma-clients/client_coa";
import { authorUser } from "~prisma-clients/extended/dm.extends";

export type AuthorWithUserRating = authorUser &
  Pick<inducks_person, "fullname">;
