import { instrument } from "@socket.io/admin-ui";
import busboy from 'busboy';
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from 'fs';
import { createServer } from "http";
import path from 'path';
import { fromBuffer } from "pdf2pic";
import { Namespace, Server } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";

import { SessionUser } from "~dm-types/SessionUser";

import { PrismaClient } from "./prisma/client_dumili";
import { authenticateUser } from './services/_auth'
import indexations from "./services/indexations";
import { FullIndexation } from "./services/indexations/types";


dotenv.config({
  path: ".env",
});

dotenv.config({
  path: ".env.local",
  override: true,
});

const [, API_KEY, API_SECRET, CLOUD_NAME] = process.env.CLOUDINARY_URL?.match(/cloudinary:\/\/(\d+):(\w+)@(\w+)/) ?? []
cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});


export type SessionDataWithIndexation = { user: SessionUser, indexation: FullIndexation }
export type SessionData = { user: SessionUser }
export class ServerWithData<Data extends object> extends Server<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  Data
> { }

export type NamespaceWithData<Services extends EventsMap, Data extends object = object> = Namespace<Services, Record<string, never>, Record<string, never>, Data>

export const prisma = new PrismaClient();


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

          const firstNewPageNumber = (await prisma.page.findFirst({
            where: {
              indexationId: indexationId
            },
            orderBy: {
              pageNumber: 'desc'
            }
          }))?.pageNumber ?? 0

          const uploadedImages = await Promise.all(imagesToUpload.map(async (filename, idx) => cloudinary.uploader.upload(filename, {
            upload_preset: "p1urov1k",
            folder: `dumili/${user.username}/${indexationId}`,
            context: `project=dumili|user=${user.username}|indexation=${indexationId}|page=${firstNewPageNumber + idx + 1}`
          }).then(({ secure_url }) => secure_url).catch(e => {
            console.error(e)
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(e);
          }).finally(() => {
            fs.unlinkSync(filename)
          }))) as string[]
          const pagesToCreate = {
            pages: {
              create: uploadedImages.map((url, idx) => ({
                pageNumber: firstNewPageNumber + idx + 1, url
              }))
            }
          }
          prisma.indexation.upsert({
            where: {
              id: indexationId
            },
            update: {
              ...pagesToCreate
            },
            create: {
              dmUserId: user.id,
              id: indexationId,
              ...pagesToCreate
            }
          }).then(() => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`upload success: ${filename}`);
          }).catch(e => {
            console.error(e)
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end(e);

          })
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

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

indexations(io)

instrument(io, {
  auth: false
});

httpServer.listen(3002);
console.log('Dumuli API open on port 3002')