
import { Errorable } from "~/services/types";
import { UserForAccountForm } from "~dm-types/UserForAccountForm";
import { user } from "~prisma-clients/client_dm";

export default interface User {
  getUser: (callback: (data: Errorable<Omit<user, "password">, 'User not found'>) => void) => void;
  deleteUser: (callback: () => void) => void;
  updateUser: (data: UserForAccountForm, callback: (data: Errorable<{
    hasRequestedPresentationSentenceUpdate: boolean;
  }, 'Bad request'>) => void) => void;
  createUser: (data: {
    username: string;
    password: string;
    email: string;
  } & Record<string, unknown>, callback: (data: Errorable<{ token: string }, 'Bad request'>) => void) => void;
}
