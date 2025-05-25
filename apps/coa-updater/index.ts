#!/usr/bin/env bun

import { $ } from "bun";
import { parse } from "csv-parse";
import { createReadStream, existsSync, mkdirSync, readFileSync } from "fs";
import { createPool } from "mariadb";

const dataPath = "/tmp/inducks",
  isvPath = `${dataPath}/isv`;

const poolParams = {
  host: process.env.MYSQL_HOST,
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  multipleStatements: true,
  connectionLimit: 5,
  permitLocalInfile: true,
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
  let cleanSql =
    readFileSync(`${isvPath}/createtables.sql`, "utf8")
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
        parse({
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

UPDATE inducks_entry entry SET is_cover = 0 WHERE issuecode IS NULL;

ALTER TABLE inducks_entry
  MODIFY COLUMN is_cover tinyint(1) not null;


CREATE INDEX inducks_issue_publicationcode_index
  ON inducks_issue (publicationcode);

set unique_checks = 1;
set foreign_key_checks = 1;
set sql_log_bin=1`;

  const cleanSqlStatements = cleanSql.split(";");

  const connection = await pool.getConnection();
  await connection.query(
    `DROP DATABASE IF EXISTS ${process.env.MYSQL_DATABASE_NEW};CREATE DATABASE ${process.env.MYSQL_DATABASE_NEW} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; set global net_buffer_length=1000000; 
set global max_allowed_packet=1000000000; `,
  );

  const newDbPool = createPool({
    ...poolParams,
    database: process.env.MYSQL_DATABASE_NEW,
  });
  const newDbConnection = await newDbPool.getConnection();
  for (const statement of cleanSqlStatements) {
    console.log(`Executing statement: ${statement}`);
    await newDbConnection.query(statement);
    console.log(" done.");
  }

  const tables = (
    await newDbConnection.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
      [process.env.MYSQL_DATABASE_NEW],
    )
  ).map((row: { table_name: string }) => row.table_name);
  newDbConnection.release();

  for (const table of tables) {
    console.log(`Renaming ${table}...`);
    await connection.query(
      `set foreign_key_checks = 0;
      drop table if exists ${process.env.MYSQL_DATABASE}.${table};
      rename table ${process.env.MYSQL_DATABASE_NEW}.${table} to ${process.env.MYSQL_DATABASE}.${table};
      set foreign_key_checks = 1;`,
    );
    console.log(" done.");
  }

  await connection.query(`drop database ${process.env.MYSQL_DATABASE_NEW}`);
  connection.release();

  console.log("mariadb-check...");
  await $`mariadb-check -h ${process.env.MYSQL_HOST} -uroot -p${process.env.MYSQL_ROOT_PASSWORD} -v ${process.env.MYSQL_DATABASE}`;
  console.log(" done.");
  await pool.end();
  await newDbPool.end();
  process.exit(0);
} catch (error) {
  console.error("Error:", (error as { message: string }).message);
}
