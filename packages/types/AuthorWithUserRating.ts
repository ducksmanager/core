import type { inducks_person } from "~prisma-schemas/schemas/coa";
import type { authorUser } from "~prisma-schemas/schemas/dm";

export type AuthorWithUserRating = authorUser &
  Pick<inducks_person, "fullname">;
