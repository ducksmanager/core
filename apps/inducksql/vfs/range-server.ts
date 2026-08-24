#!/usr/bin/env bun

/**
 * Minimal Range-honouring static server, used by http-vfs.test.ts and handy for local
 * development against the artifact. Runs as its own process: the test's transport blocks the
 * event loop synchronously, so a server sharing that loop could never answer it.
 */

const path = process.argv[2];
const port = Number(process.argv[3] ?? 0);
if (!path) throw new Error("usage: range-server.ts <file> [port]");

const file = Bun.file(path);
const size = file.size;

const server = Bun.serve({
  port,
  fetch(request) {
    const headers = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (request.method === "HEAD") {
      return new Response(null, {
        headers: { ...headers, "Content-Length": String(size) },
      });
    }
    const range = request.headers.get("range");
    if (!range) return new Response(file, { headers });

    const [rawStart, rawEnd] = range.replace("bytes=", "").split("-");
    const start = Number(rawStart);
    const end = Math.min(rawEnd ? Number(rawEnd) : size - 1, size - 1);
    if (!Number.isFinite(start) || start > end) {
      return new Response(null, {
        status: 416,
        headers: { ...headers, "Content-Range": `bytes */${size}` },
      });
    }
    return new Response(file.slice(start, end + 1), {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}` },
    });
  },
});

console.log(`READY ${server.port} ${size}`);
