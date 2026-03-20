#!/usr/bin/env bun

import { $ } from "bun";
import { parse } from "csv-parse";
import { createReadStream, existsSync, mkdirSync, readFileSync } from "fs";
import { createPool } from "mariadb";

const dataPath = "/tmp/inducks",
  isvPath = `${dataPath}/isv`;

/** Run CLI without a shell so MYSQL_ROOT_PASSWORD is not mangled ($, !, spaces, etc.). */
async function runMariadbCheck(): Promise<number> {
  const host = process.env.MYSQL_HOST;
  const password = process.env.MYSQL_ROOT_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  if (!host || password === undefined || !database) {
    throw new Error(
      "MYSQL_HOST, MYSQL_ROOT_PASSWORD, and MYSQL_DATABASE are required for mariadb-check",
    );
  }
  const proc = Bun.spawn(
    [
      "mariadb-check",
      "-h",
      host,
      "-uroot",
      `-p${password}`,
      "-v",
      database,
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  return proc.exited;
}

const poolParams = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  connectionLimit: 5,
  multipleStatements: true,
  permitLocalInfile: true,
  sessionVariables: {
    net_read_timeout: 1800, // 30 minutes
    net_write_timeout: 1800, // 30 minutes
    wait_timeout: 3600, // 1 hour
  },
};
const pool = createPool(poolParams);

console.log("Pool created");

try {
  if (existsSync(isvPath)) {
    console.log("ISV files already exist, skipping download");
  } else {
    mkdirSync(isvPath, { recursive: true });
    await $`wget -c https://inducks.org/inducks/isv.tgz -O - | tar -xz -C ${dataPath}`;
  }
  // Ignore lines with invalid UTF-8 characters
  for await (const file of $`ls ${isvPath}/*.isv`.lines()) {
    if (file) {
      await $`iconv -f utf-8 -t utf-8 -c "${file}" > "${file}.clean" && mv -f "${file}.clean" "${file}"`;
    }
  }

  console.log("iconv done");
  let cleanSql = readFileSync(`${isvPath}/createtables.sql`, "utf8")
    .split("\n")
    .filter(
      (line) =>
        !(
          ["USE ", "RENAME ", "DROP ", "# Step ", "#End of file"].some(
            (prefix) => line.startsWith(prefix),
          ) ||
          /^.+priv[^;]+;$/.test(line) ||
          /^CREATE TABLE IF NOT EXISTS ([^ ]+) LIKE \1_temp/.test(line)
        ),
    )
    .join("\n")
    // TODO uncomment? Replace "pk0" indexes with actual primary keys
    // .replace(/KEY pk0/gms, "CONSTRAINT `PRIMARY` PRIMARY KEY")

    // Replace ISV file paths with absolute paths
    .replace(
      /LOAD DATA LOCAL INFILE ".\/([^"]+)"/gms,
      `LOAD DATA LOCAL INFILE '${dataPath}/$1'`,
    )
    // Prefix fulltext indexes with table name
    .replace(
      /(ALTER TABLE )(([^ ]+)_temp)( ADD FULLTEXT)(\([^()]+\));/gs,
      "$1$2$4 fulltext_$3 $5;",
    ) + "ALTER TABLE inducks_story_temp ADD FULLTEXT(storycode);";

  console.log("Renaming foreign keys...");
  for (let fkIndex = 0; fkIndex <= 5; fkIndex++) {
    cleanSql = cleanSql.replace(
      new RegExp(
        `(CREATE TABLE ((?:(?!_temp).)+?)_temp(?:(?!KEY fk'${fkIndex}')[^;])+?)KEY (fk)('${fkIndex}')`,
        "gms",
      ),
      "$1KEY $3_$2$4",
    );
  }
  console.log("done.");

  cleanSql = cleanSql.replace(/_temp/g, "");

  const textFieldsToTransform = { inducks_person: ["fullname"] };
  for (const [table, fields] of Object.entries(textFieldsToTransform)) {
    for (const field of fields) {
      const parser = createReadStream(`${isvPath}/${table}.isv`).pipe(
        parse<{ [key: string]: string }>({
          delimiter: "^",
          columns: true,
          quote: null,
        }),
      );
      let maxLength = 0;
      for await (const record of parser) {
        if (record[field]) {
          maxLength = Math.max(maxLength, record[field].length);
        }
      }
      console.log(`Max length for ${table}.${field}: ${maxLength}`);
      cleanSql = cleanSql.replace(
        new RegExp(`(?<=CREATE TABLE ${table})([^;]+ ${field} )text`),
        `$1varchar(${maxLength})`,
      );
    }
  }

  cleanSql = `
set unique_checks = 0;
set foreign_key_checks = 0;
set sql_log_bin=0;
${cleanSql}
ALTER TABLE inducks_entryurl ADD id INT AUTO_INCREMENT NOT NULL, ADD PRIMARY KEY (id);

# Add full text index on entry titles
ALTER TABLE inducks_entry ADD FULLTEXT INDEX entryTitleFullText(title);


ALTER TABLE inducks_entry
  ADD COLUMN is_cover tinyint(1) default null null;

CREATE INDEX inducks_entry_is_cover_index
  ON inducks_entry (is_cover);

CREATE INDEX inducks_entry_issuecode_position_index
  ON inducks_entry (issuecode, position);

UPDATE inducks_entry entry
INNER JOIN (
  SELECT issuecode, MIN(position) as min_position
  FROM inducks_entry
  WHERE issuecode != ''
  GROUP BY issuecode
) min_pos ON entry.issuecode = min_pos.issuecode
SET entry.is_cover = IF(entry.position = min_pos.min_position AND entry.issuecode != '', 1, 0);

UPDATE inducks_entry entry SET is_cover = 0 WHERE is_cover IS NULL;

ALTER TABLE inducks_entry
  MODIFY COLUMN is_cover tinyint(1) not null;


CREATE INDEX inducks_issue_publicationcode_index
  ON inducks_issue (publicationcode);

set unique_checks = 1;
set foreign_key_checks = 1;
set sql_log_bin=1`;

  const cleanSqlStatements = cleanSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const setupConnection = await pool.getConnection();
  for (const statement of [
    `DROP DATABASE IF EXISTS ${process.env.MYSQL_DATABASE_NEW}`,
    `CREATE DATABASE ${process.env.MYSQL_DATABASE_NEW} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    "SET GLOBAL net_buffer_length=1000000",
    "SET GLOBAL max_allowed_packet=1000000000",
  ]) {
    await setupConnection.query(statement);
  }
  await setupConnection.release();

  const newDbPool = createPool({
    ...poolParams,
    database: process.env.MYSQL_DATABASE_NEW,
  });
  const newDbConnection = await newDbPool.getConnection();
  await newDbConnection.query("SET SESSION net_read_timeout = 1800");
  await newDbConnection.query("SET SESSION net_write_timeout = 1800");
  await newDbConnection.query("SET SESSION wait_timeout = 3600");
  for (const statement of cleanSqlStatements) {
    console.log(`Executing statement: ${statement}`);
    await newDbConnection.query(statement);
    console.log(" done.");
  }

  console.log(
    `Listing tables in ${process.env.MYSQL_DATABASE_NEW} (information_schema)...`,
  );
  const tables = (
    await newDbConnection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name`,
      [process.env.MYSQL_DATABASE_NEW],
    )
  ).map((row: { table_name: string }) => row.table_name);
  console.log(`Found ${tables.length} tables to rename.`);
  await newDbConnection.release();

  console.log("Acquiring connection for rename phase...");
  const renameConnection = await pool.getConnection();
  await renameConnection.query("SET SESSION net_read_timeout = 7200");
  await renameConnection.query("SET SESSION net_write_timeout = 7200");
  await renameConnection.query("SET SESSION wait_timeout = 28800");

  for (const table of tables) {
    console.log(`Renaming ${table}...`);
    await renameConnection.query("SET foreign_key_checks = 0");
    await renameConnection.query(
      `DROP TABLE IF EXISTS ${process.env.MYSQL_DATABASE}.${table}`,
    );
    await renameConnection.query(
      `RENAME TABLE ${process.env.MYSQL_DATABASE_NEW}.${table} TO ${process.env.MYSQL_DATABASE}.${table}`,
    );
    await renameConnection.query("SET foreign_key_checks = 1");
    console.log(" done.");
  }

  await renameConnection.query(`drop database ${process.env.MYSQL_DATABASE_NEW}`);
  await renameConnection.release();

  console.log("mariadb-check...");
  const checkExit = await runMariadbCheck();
  if (checkExit !== 0) {
    throw new Error(`mariadb-check exited with code ${checkExit}`);
  }
  console.log(" done.");
  await pool.end();
  await newDbPool.end();
  process.exit(0);
} catch (error) {
  console.error("Error:", (error as { message: string }).message);
}
