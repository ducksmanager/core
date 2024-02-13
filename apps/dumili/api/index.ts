
import dotenv from "dotenv";
import { fromBuffer } from "pdf2pic";
dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});


import { instrument } from "@socket.io/admin-ui";
import busboy from 'busboy';
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import { createServer } from "http";
import path from 'path';
import { Namespace, Server } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";

import { SessionUser } from "~dm-types/SessionUser";

import { authenticateUser } from './services/_auth'
import cloudinaryIndexations from "./services/cloudinary-indexations";
import { ResourcesWithContext } from "./services/cloudinary-indexations/types";

export type SessionDataWithIndexation = { user: SessionUser, indexation: { id: string, resources: ResourcesWithContext } }
export type SessionData = Pick<SessionDataWithIndexation, 'user' | 'indexation'>
export class ServerWithData<Data extends object> extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Data
> { }

export type NamespaceWithData<Services extends EventsMap, Data extends object = object> = Namespace<Services, Record<string, never>, Record<string, never>, Data>

const httpServer = createServer(async (req, res) => {
  if (req.url === '/upload') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
    }
    else {
      const { headers } = req
      const indexationId = headers['x-dumili-indexation-id'] as string
      const token = headers['x-token'] as string
      authenticateUser(token).then(user => {
        const filename = '';
        const bb = busboy({ headers });
        bb.on('file', async (name, file, info) => {
          let imagesToUpload: string[]
          switch (info.mimeType) {
            case 'image/jpg': case 'image/jpeg': case 'image/png':
              const saveTo = path.join(__dirname, name);
              file.pipe(fs.createWriteStream(saveTo));
              imagesToUpload = [filename]
              break;
            case 'application/pdf':
              const chunks = []
              for await (const chunk of file) {
                chunks.push(chunk)
              }
              const buffer = (Buffer.concat(chunks));
              imagesToUpload = (await fromBuffer(buffer, { saveFilename: info.filename.replace('.pdf', '') })
                .bulk(-1))
                .map(({ path }) => path!)
              break;
            default:
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.write('Unsupported file type:' + info.mimeType)
              return
          }

          for (let idx = 0; idx < imagesToUpload.length; idx++) {
            const filename = imagesToUpload[idx]
            await cloudinary.uploader.upload(filename, {
              uploadPreset: "p1urov1k",
              folder: `dumili/${user.username}/${indexationId}`,
              sources: ["local"],
              multiple: true,
              maxImageFileSize: 5000000,
              context: {
                project: "dumili",
                user: user.username,
                indexation: indexationId,
                page: idx+1,
              },
            }).catch(e => {
              console.error(e)
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end(e);
            }).finally(() => {
              fs.unlinkSync(filename)
            })
          }
        });
        bb.on('close', () => {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(`upload success: ${filename}`);
        });
        req.pipe(bb);
      }).catch(e => {
        console.error(e)
        res.writeHead(401, { 'Content-Type': 'text/plain' });
        res.end(e);
      })
    }
  }
  else {
    res.writeHead(404)
    res.end()
  }
});

const io = new ServerWithData<SessionData>(httpServer, {
  cors: {
    origin: '*',
  },
});

instrument(io, {
  auth: false
});

cloudinaryIndexations(io)

httpServer.listen(3002);
console.log('Dumuli API open on port 3002')
