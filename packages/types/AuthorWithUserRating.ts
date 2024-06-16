import { inducks_person } from "~prisma-clients/client_coa";
import { authorUser } from "~prisma-clients/client_dm";

export type AuthorWithUserRating = authorUser & Pick<inducks_person, 'fullname'>