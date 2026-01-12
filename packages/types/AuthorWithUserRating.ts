import type { inducks_person } from "~prisma-schemas/schemas/coa/client/client";
import type { authorUser } from "~prisma-schemas/schemas/dm/client/client";

export type AuthorWithUserRating = authorUser &
  Pick<inducks_person, "fullname">;
