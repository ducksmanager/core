export interface SessionUser {
  id: number;
  username: string;
  hashedPassword: string;
  privileges: { [privilegeScope: string]: string };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: SessionUser | null;
    }
  }
}
