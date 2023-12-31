import { Server, Socket } from "socket.io";

import { User } from "~dm-types/SessionUser";

export class ServerWithUser extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
> {}

export type SocketWithUser = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  { user?: User }
>;
