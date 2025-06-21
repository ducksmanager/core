export interface SessionUser {
  id: number;
  username: string;
  hashedPassword: string;
  privileges: { [privilegeScope: string]: string };
  token: string;
}
