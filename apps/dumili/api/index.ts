import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

import { instrument } from "@socket.io/admin-ui";
import { Namespace, Server } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";

import { SessionUser } from "~dm-types/SessionUser";

import cloudinaryIndexations, { getIndexationResources } from "./services/cloudinary-indexations";

export type SessionDataWithIndexation =  { user: SessionUser, indexation: { id: string, resources: Awaited<ReturnType<typeof getIndexationResources>>}}
export type SessionData =  Pick<SessionDataWithIndexation, 'user'| 'indexation'>
export class ServerWithData<Data extends object> extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Data
> { }

export type NamespaceWithData<Services extends EventsMap,Data extends object = object> = Namespace<Services, Record<string,never>,Record<string,never>, Data >


const io = new ServerWithData<SessionData>({
  cors: {
    origin: '*',
  },
});

instrument(io, {
  auth: false
});

cloudinaryIndexations(io)

io.listen(3002);
console.log('Dumuli API open on port 3002')
