export interface UserCredentials {
  username: string;
  passwordHash: string;
}

export interface User extends UserCredentials {
  id: number;
  roles?: string;
}
