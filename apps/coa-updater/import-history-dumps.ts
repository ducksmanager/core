#!/usr/bin/env bun
/**
 * Restore gzip’d mysqldump files into **one MariaDB schema per backup date** (`coa_hist_YYYY_MM_DD`),
 * produced by packages/backup (multi-database dumps: coa, dm, …). Only the **`coa` section** is applied;
 * other databases are never written, so dev/prod `dm` / etc. are not overwritten.
 *
 * Usage:
 *   bun import-history-dumps.ts --dir /path/to/dumps [--dry-run]
 *
 * Expects each file named like: dump-2026-05-05T05:33:22.494Z.gz (date = first YYYY-MM-DD after "dump-").
 * Skips a file when schema `coa_hist_YYYY_MM_DD` already exists.
 *
 * Requires: MYSQL_HOST, MYSQL_ROOT_PASSWORD (same as coa-updater). MYSQL_PORT optional (default 3306).
 */

import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createGunzip } from "node:zlib";
import readline from "node:readline";
import { createPool } from "mariadb";

import {
  datedSnapshotSchemaExists,
  snapshotSchemaForDate,
} from "./snapshot-history";

const qIdent = (name: string) => `\`${name.replace(/`/g, "``")}\``;

/**
 * Extract only the coa section to a temporary SQL file:
 * lines between "Current Database: `coa`" and the next "Current Database".
 * Rewrites identifier `` `coa` `` → `` `targetDatabase` `` (only backtick-wrapped `coa`).
 */
const parseCurrentDatabaseMarker = (line: string): string | null => {
  const m = line.match(/^--\s*Current Database:\s*`([^`]+)`\s*$/);
  return m?.[1] ?? null;
};

const waitForDrain = (ws: ReturnType<typeof createWriteStream>) =>
  new Promise<void>((resolve, reject) => {
    const onDrain = () => {
      ws.off("error", onError);
      resolve();
    };
    const onError = (err: Error) => {
      ws.off("drain", onDrain);
      reject(err);
    };
    ws.once("drain", onDrain);
    ws.once("error", onError);
  });

const writeLine = async (
  ws: ReturnType<typeof createWriteStream>,
  line: string,
) => {
  const ok = ws.write(`${line}\n`);
  if (!ok) {
    await waitForDrain(ws);
  }
};

const endWriteStream = (ws: ReturnType<typeof createWriteStream>) =>
  new Promise<void>((resolve, reject) => {
    ws.end(() => resolve());
    ws.once("error", reject);
  });

const extractCoaSectionToTempSql = async (
  gzPath: string,
  tempSqlPath: string,
  targetDatabase: string,
): Promise<number> => {
  const input = createReadStream(gzPath);
  const gunzip = createGunzip();
  const rl = readline.createInterface({
    input: input.pipe(gunzip),
    crlfDelay: Infinity,
  });
  const output = createWriteStream(tempSqlPath, { encoding: "utf8" });

  let inCoa = false;
  let done = false;
  let linesWritten = 0;

  try {
    for await (const line of rl) {
      if (done) continue;

      const marker = parseCurrentDatabaseMarker(line);
      if (marker !== null) {
        if (!inCoa) {
          if (marker === "coa") {
            inCoa = true;
          } else {
            continue;
          }
        } else if (marker !== "coa") {
          done = true;
          continue;
        }
      }

      if (!inCoa) continue;

      const rewritten = line.replaceAll("`coa`", `\`${targetDatabase}\``);
      await writeLine(output, rewritten);
      linesWritten++;
    }
  } finally {
    rl.close();
    await endWriteStream(output);
  }

  if (!inCoa || linesWritten === 0) {
    throw new Error(`No coa section found in ${gzPath}`);
  }
  return 0;
};

const importSqlFileToMariadb = (
  sqlPath: string,
  host: string,
  port: number,
  password: string,
) =>
  new Promise<number>((resolve, reject) => {
    const args = [
      "-h",
      host,
      "-P",
      String(port),
      "-uroot",
      `-p${password}`,
      "--max-allowed-packet=1G",
      "--init-command=SET SESSION net_read_timeout=7200; SET SESSION net_write_timeout=7200",
    ];
    const proc = spawn("mariadb", args, {
      stdio: ["pipe", "inherit", "inherit"],
    });
    proc.on("error", reject);
    proc.on("exit", (code, signal) => {
      if (signal) reject(new Error(`mariadb killed (${signal})`));
      else resolve(code ?? 1);
    });
    const stream = createReadStream(sqlPath, { encoding: "utf8" });
    stream.on("error", reject);
    proc.stdin?.on("error", (err) => {
      const e = err as NodeJS.ErrnoException;
      if (e.code !== "EPIPE") reject(err);
    });
    stream.pipe(proc.stdin!);
  });

const parseArgs = () => {
  const argv = process.argv.slice(2);
  let dir = "";
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") {
      console.log(
        "Usage: bun import-history-dumps.ts [--dir] <path-to-dumps> [--dry-run]",
      );
      process.exit(0);
    }
    if (a === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (a === "--dir" && argv[i + 1]) {
      dir = argv[++i]!;
      continue;
    }
    if (!a.startsWith("-") && !dir) {
      dir = a;
      continue;
    }
  }
  return { dir, dryRun };
};

const parseDumpDateFromName = (filename: string) => {
  const m = filename.match(/^dump-(\d{4}-\d{2}-\d{2})(?:T|\.|\.gz|$)/);
  return m ? m[1]! : null;
};

const main = async () => {
  const { dir: dirArg, dryRun } = parseArgs();
  const dumpDir = dirArg.trim();
  if (!dumpDir) {
    console.error("Missing dump directory. Try --help.");
    process.exit(1);
  }
  if (!existsSync(dumpDir)) {
    throw new Error(`Directory does not exist: ${dumpDir}`);
  }

  const host = process.env.MYSQL_HOST;
  const password = process.env.MYSQL_ROOT_PASSWORD;
  const port = parseInt(process.env.MYSQL_PORT || "3306", 10);

  if (!host || password === undefined) {
    throw new Error("MYSQL_HOST and MYSQL_ROOT_PASSWORD are required");
  }

  const pool = createPool({
    host,
    port,
    user: "root",
    password,
    connectionLimit: 3,
    multipleStatements: true,
    permitLocalInfile: true,
    sessionVariables: {
      net_read_timeout: 7200,
      net_write_timeout: 7200,
      wait_timeout: 28800,
    },
  });

  const names = await readdir(dumpDir);
  const candidates = names
    .filter((n) => n.endsWith(".gz") && n.startsWith("dump-"))
    .map((n) => {
      const d = parseDumpDateFromName(n);
      return d ? { name: n, snapshotDate: d } : null;
    })
    .filter((x): x is { name: string; snapshotDate: string } => x !== null)
    .sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate));

  console.log(
    `Found ${candidates.length} dump-*.gz files with a parsable date in ${dumpDir}`,
  );

  for (const { name, snapshotDate } of candidates) {
    const fullPath = path.join(dumpDir, name);
    console.log(`\n--- ${name} (snapshot_date=${snapshotDate}) ---`);

    const snapSchema = snapshotSchemaForDate(snapshotDate);

    if (await datedSnapshotSchemaExists(pool, snapshotDate)) {
      console.log(`Skip: schema ${snapSchema} already exists`);
      continue;
    }

    if (dryRun) {
      console.log(`Dry-run: would restore coa section into ${snapSchema}`);
      continue;
    }

    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "coa-history-import-"));
    const tempSqlPath = path.join(tmpDir, "coa-only.sql");

    try {
      console.log("Extracting coa section to temporary SQL file...");
      const extractExit = await extractCoaSectionToTempSql(
        fullPath,
        tempSqlPath,
        snapSchema,
      );
      if (extractExit !== 0) {
        throw new Error(`failed to extract coa section from ${name}`);
      }

      const setup = await pool.getConnection();
      try {
        await setup.query(`DROP DATABASE IF EXISTS ${qIdent(snapSchema)}`);
      } finally {
        setup.release();
      }

      console.log(`Importing extracted coa SQL into ${snapSchema}...`);
      const impExit = await importSqlFileToMariadb(
        tempSqlPath,
        host,
        port,
        password,
      );
      if (impExit !== 0) {
        throw new Error(`mysqldump import failed with exit ${impExit} for ${name}`);
      }
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }

    console.log(`Done: ${snapshotDate}`);
  }

  await pool.end();
  console.log("\nAll requested dumps processed.");
};

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
