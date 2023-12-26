import { Errorable, NamespaceGeneric, SocketGeneric } from "../types";

export interface Services {
    login: (data: { username: string; password: string }, callback: (data: Errorable<string, 'Invalid username or password'>) => void) => void;
    getCsrf: (callback: (value: string) => void) => void;
}

export type Socket = SocketGeneric<Services>;
export class Namespace extends NamespaceGeneric<Services> {
    public static endpoint = '/login'
}
