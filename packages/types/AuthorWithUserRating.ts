import { inducks_person } from "~prisma-schemas/client_coa";
import { authorUser } from "~prisma-schemas/client_dm";

export type AuthorWithUserRating = authorUser & Pick<inducks_person, 'fullname'>