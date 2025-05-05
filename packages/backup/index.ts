#!/usr/bin/env bun

import { Client } from "basic-ftp";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import * as process from "process";

dotenv.config();

const {
  FTP_HOST,
  FTP_USER,
  FTP_PASSWORD,
  DATABASE_URL_COA,
} = process.env as {
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
    `mariadb-dump -h ${MYSQL_HOST} -uroot -p${MYSQL_ROOT_PASSWORD} -P ${MYSQL_PORT} --all-databases | gzip > dump.gz`,
  ).toString(),
);

const client = new Client();
client.ftp.verbose = true;
try {
  await client.access({
    host: FTP_HOST,
    user: FTP_USER,
    password: FTP_PASSWORD,
  });
  console.log(await client.list());
  await client.uploadFrom("dump.gz", `dump-${new Date().toISOString()}.gz`);
} catch (err) {
  console.log(err);
}
client.close();
