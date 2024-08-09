import type { SessionUser } from "~dm-types/SessionUser";

export const getUserCredentials = (user: SessionUser) => ({
  "x-dm-user": user.username,
  "x-dm-pass": user.hashedPassword,
});
