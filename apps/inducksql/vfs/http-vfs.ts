/**
 * Read-only SQLite VFS backed by HTTP range requests.
 *
 * xRead is synchronous, so the transport must be too: createXhrSource uses synchronous XHR,
 * which is permitted only in a Worker. That avoids SharedArrayBuffer, and so COOP/COEP.
 */

export type RangeSource = {
  size: number;
  read(offset: number, length: number): Uint8Array;
};

export type HttpVfsStats = {
  rangeRequests: number;
  bytesFetched: number;
  blockHits: number;
  blockMisses: number;
};

export type HttpVfsOptions = {
  resolve: (path: string) => RangeSource | null;
  name?: string;
  /**
   * Bytes per fetch. Raising this helps less than expected: b-tree descent issues *dependent*
   * reads that read-ahead cannot predict. http-vfs.test.ts reports requests and bytes.
   */
  blockSize?: number;
  maxBlocks?: number;
};

type Handle = {
  source: RangeSource;
  blocks: Map<number, Uint8Array>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sqlite3 = any;

export const installHttpVfs = (
  sqlite3: Sqlite3,
  options: HttpVfsOptions,
): { stats: HttpVfsStats } => {
  const { capi, wasm } = sqlite3;
  const name = options.name ?? "http";
  const blockSize = options.blockSize ?? 16 * 1024;
  const maxBlocks = options.maxBlocks ?? 512;

  const stats: HttpVfsStats = {
    rangeRequests: 0,
    bytesFetched: 0,
    blockHits: 0,
    blockMisses: 0,
  };

  const handles = new Map<number, Handle>();

  const block = (handle: Handle, index: number) => {
    const cached = handle.blocks.get(index);
    if (cached) {
      handle.blocks.delete(index);
      handle.blocks.set(index, cached);
      stats.blockHits++;
      return cached;
    }
    stats.blockMisses++;
    const start = index * blockSize;
    const length = Math.min(blockSize, handle.source.size - start);
    const bytes = handle.source.read(start, length);
    stats.rangeRequests++;
    stats.bytesFetched += bytes.byteLength;
    handle.blocks.set(index, bytes);
    if (handle.blocks.size > maxBlocks) {
      handle.blocks.delete(handle.blocks.keys().next().value as number);
    }
    return bytes;
  };

  const readInto = (
    handle: Handle,
    dest: Uint8Array,
    offset: number,
    length: number,
  ) => {
    const available = Math.max(
      0,
      Math.min(length, handle.source.size - offset),
    );
    let done = 0;
    while (done < available) {
      const at = offset + done;
      const index = Math.floor(at / blockSize);
      const bytes = block(handle, index);
      const from = at - index * blockSize;
      const take = Math.min(available - done, bytes.byteLength - from);
      if (take <= 0) break;
      dest.set(bytes.subarray(from, from + take), done);
      done += take;
    }
    return done;
  };

  const ioMethods = new capi.sqlite3_io_methods();
  const vfs = new capi.sqlite3_vfs();
  const base = new capi.sqlite3_vfs(capi.sqlite3_vfs_find(null));

  ioMethods.$iVersion = 1;
  vfs.$iVersion = 2;
  vfs.$szOsFile = capi.sqlite3_file.structInfo.sizeof;
  vfs.$mxPathname = base.$mxPathname;
  for (const method of [
    "xRandomness",
    "xSleep",
    "xCurrentTime",
    "xCurrentTimeInt64",
    "xGetLastError",
    "xDlOpen",
    "xDlError",
    "xDlSym",
    "xDlClose",
  ]) {
    vfs[`$${method}`] = base[`$${method}`];
  }

  sqlite3.vfs.installVfs({
    io: {
      struct: ioMethods,
      methods: {
        xClose: (pFile: number) => {
          handles.delete(pFile);
          return 0;
        },
        xRead: (
          pFile: number,
          pDest: number,
          amount: number,
          offset: number | bigint,
        ) => {
          const handle = handles.get(pFile);
          if (!handle) return capi.SQLITE_IOERR;
          const at = Number(offset);
          const scratch = new Uint8Array(amount);
          const got = readInto(handle, scratch, at, amount);
          wasm.heap8u().set(scratch, pDest);
          // A short read must be zero-filled and reported, or SQLite treats it as corruption.
          return got === amount ? 0 : capi.SQLITE_IOERR_SHORT_READ;
        },
        xWrite: () => capi.SQLITE_READONLY,
        xTruncate: () => capi.SQLITE_READONLY,
        xSync: () => capi.SQLITE_READONLY,
        xFileSize: (pFile: number, pOut: number) => {
          const handle = handles.get(pFile);
          if (!handle) return capi.SQLITE_IOERR;
          wasm.poke(pOut, handle.source.size, "i64");
          return 0;
        },
        xLock: () => 0,
        xUnlock: () => 0,
        xCheckReservedLock: (_pFile: number, pOut: number) => {
          wasm.poke(pOut, 0, "i32");
          return 0;
        },
        xFileControl: () => capi.SQLITE_NOTFOUND,
        xSectorSize: () => 4096,
        // IMMUTABLE lets SQLite skip locking and change detection entirely.
        xDeviceCharacteristics: () => capi.SQLITE_IOCAP_IMMUTABLE,
      },
    },
    vfs: {
      struct: vfs,
      name,
      methods: {
        xOpen: (
          _pVfs: number,
          zName: number,
          pFile: number,
          flags: number,
          pOutFlags: number,
        ) => {
          const path = zName ? wasm.cstrToJs(zName) : "";
          const source = options.resolve(path);
          if (!source) return capi.SQLITE_CANTOPEN;
          const file = new capi.sqlite3_file(pFile);
          file.$pMethods = ioMethods.pointer;
          handles.set(pFile, { source, blocks: new Map() });
          if (pOutFlags) {
            wasm.poke(pOutFlags, flags | capi.SQLITE_OPEN_READONLY, "i32");
          }
          return 0;
        },
        // Journals and WAL sidecars must report absent so SQLite never tries to recover them.
        xAccess: (
          _pVfs: number,
          zName: number,
          _flags: number,
          pOut: number,
        ) => {
          const path = zName ? wasm.cstrToJs(zName) : "";
          wasm.poke(pOut, options.resolve(path) ? 1 : 0, "i32");
          return 0;
        },
        xDelete: () => 0,
        xFullPathname: (
          _pVfs: number,
          zName: number,
          nOut: number,
          pOut: number,
        ) => {
          const path = zName ? wasm.cstrToJs(zName) : "";
          const bytes = new TextEncoder().encode(path);
          if (bytes.byteLength + 1 > nOut) return capi.SQLITE_CANTOPEN;
          const heap = wasm.heap8u();
          heap.set(bytes, pOut);
          heap[pOut + bytes.byteLength] = 0;
          return 0;
        },
      },
    },
  });

  return { stats };
};

/** Worker only. The URL must honour Range and carry no whole-file Content-Encoding. */
export const createXhrSource = (url: string): RangeSource => {
  const probe = new XMLHttpRequest();
  probe.open("HEAD", url, false);
  probe.send();
  if (probe.status < 200 || probe.status >= 300) {
    throw new Error(`HEAD ${url} failed with ${probe.status}`);
  }
  if (probe.getResponseHeader("Accept-Ranges") !== "bytes") {
    throw new Error(`${url} does not advertise Accept-Ranges: bytes`);
  }
  const size = Number(probe.getResponseHeader("Content-Length"));
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error(`${url} returned no usable Content-Length`);
  }

  return {
    size,
    read(offset, length) {
      const request = new XMLHttpRequest();
      request.open("GET", url, false);
      request.responseType = "arraybuffer";
      request.setRequestHeader(
        "Range",
        `bytes=${offset}-${offset + length - 1}`,
      );
      request.send();
      // 206 is the expected answer; a 200 means the server ignored Range and sent everything.
      if (request.status !== 206) {
        throw new Error(
          `Range request for ${length}B at ${offset} returned ${request.status}, expected 206`,
        );
      }
      return new Uint8Array(request.response as ArrayBuffer);
    },
  };
};
