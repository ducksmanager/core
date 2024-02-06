import dotenv from "dotenv";
import { Namespace, Server } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";

import { SessionUser } from "~dm-types/SessionUser";

import { getIndexationResources } from "./services/cloudinary-indexations";

export type SessionDataWithIndexation =  { user: SessionUser, indexation: { id: string } & Awaited<ReturnType<typeof getIndexationResources>>}
export type SessionData =  Pick<SessionDataWithIndexation, 'user'> & Partial<Pick<SessionDataWithIndexation, 'indexation'>>
export class ServerWithData<Data extends object> extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Data
> { }

export type NamespaceWithData<Services extends EventsMap,Data extends object = object> = Namespace<Services, Record<string,never>,Record<string,never>, Data >

dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

const io = new ServerWithData({
  cors: {
    origin: '*',
  },
});

io.listen(3002);
