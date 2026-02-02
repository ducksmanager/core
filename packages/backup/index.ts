#!/usr/bin/env bun

import { Client } from "basic-ftp";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import { statSync, unlinkSync } from "fs";
import * as process from "process";

dotenv.config();

const { FTP_HOST, FTP_USER, FTP_PASSWORD, DATABASE_URL_COA } = process.env as {
  FTP_HOST: string;
  FTP_USER: string;
  FTP_PASSWORD: string;
  DATABASE_URL_COA: string;
};

const [
  _protocol,
  _username,
  MYSQL_ROOT_PASSWORD,
  MYSQL_HOST,
  MYSQL_PORT,
  _coaDatabase,
] = DATABASE_URL_COA.split(/\W+/);

console.log(
  execSync(
    `mariadb-dump -h ${MYSQL_HOST} -uroot -p${MYSQL_ROOT_PASSWORD} -P ${MYSQL_PORT} --all-databases | gzip > dump.gz`
  ).toString()
);

const DUMP_FILE = "dump.gz";
const DUMP_DIR = "./dumps";
const DUMP_FILE_PREFIX = "dump-";

const newBackupSize = statSync(DUMP_FILE).size;
console.log(`New backup size: ${(newBackupSize / 1024 / 1024).toFixed(2)} MB`);

const client = new Client(0);
client.ftp.verbose = true;

try {
  await client.access({
    host: FTP_HOST,
    user: FTP_USER,
    password: FTP_PASSWORD,
  });

  try {
    await client.ensureDir(DUMP_DIR);
  } catch (err) {
    console.error("Error:", err);
  }

  const getBackupFiles = () =>
    client
      .list(DUMP_DIR)
      .then((files) =>
        files.filter((file) => file.name.startsWith(DUMP_FILE_PREFIX))
      )
      .then((files) =>
        files.map((file) => ({
          name: file.name,
          size: file.size,
          date: file.rawModifiedAt || file.modifiedAt,
          fullPath: `${DUMP_DIR}/${file.name}`,
        }))
      )
      .then((files) =>
        files.map((file) => ({
          ...file,
          timestamp: file.date ? new Date(file.date).getTime() : 0,
        }))
      )
      .then((files) => files.sort((a, b) => a.timestamp - b.timestamp));

  const freeUpSpace = async (requiredSize: number) => {
    const backupFiles = await getBackupFiles();
    let freedSpace = 0;
    const deletedFiles: string[] = [];

    for (const file of backupFiles) {
      if (freedSpace >= requiredSize) {
        break;
      }
      try {
        console.log(
          `Deleting old backup: ${file.name} (${(
            file.size /
            1024 /
            1024
          ).toFixed(2)} MB)`
        );
        await client.remove(file.fullPath);
        freedSpace += file.size;
        deletedFiles.push(file.name);
      } catch (err) {
        console.error(`Failed to delete ${file.name}:`, err);
      }
    }

    if (deletedFiles.length) {
      console.log(
        `Freed ${(freedSpace / 1024 / 1024).toFixed(2)} MB by deleting ${
          deletedFiles.length
        } old backup(s)`
      );
    }

    return freedSpace;
  };

  const uploadBackup = async () => {
    const backupFileName = `${DUMP_FILE_PREFIX}${new Date().toISOString()}.gz`;
    const backupPath = `${DUMP_DIR}/${backupFileName}`;
    await client.uploadFrom(DUMP_FILE, backupPath);
    console.log(`Successfully uploaded backup: ${backupFileName}`);
  };

  try {
    await uploadBackup();
  } catch (uploadError: any) {
    const errorMessage = uploadError?.message?.toLowerCase() || "";
    const isSpaceError = errorMessage.includes("no space");

    if (isSpaceError) {
      console.log(
        "Upload failed due to insufficient disk space. Cleaning up old backups..."
      );
      await freeUpSpace(newBackupSize);
      console.log("Retrying upload after cleanup...");
      await uploadBackup();
    } else {
      throw uploadError;
    }
  }
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
} finally {
  client.close();
  try {
    unlinkSync(DUMP_FILE);
  } catch (err) {
    console.error("Error:", err);
  }
}
