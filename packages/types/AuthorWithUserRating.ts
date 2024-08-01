import type { inducks_person } from "~prisma-clients/schemas/coa";
import type { authorUser } from "~prisma-clients/schemas/dm";

export type AuthorWithUserRating = authorUser &
  Pick<inducks_person, "fullname">;
