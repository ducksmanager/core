import { typeMap } from "./config";
import type { Table } from "./introspect";

export const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;

const enumValues = (columnType: string) =>
  columnType
    .slice("enum(".length, -1)
    .match(/'(?:[^']|'')*'/g)
    ?.map((value) => value.slice(1, -1).replaceAll("''", "'")) ?? [];

export const createTable = (table: Table, enumChecks: boolean) => {
  const { name, columns, primaryKey, fulltextColumns } = table;

  const rowidAlias =
    primaryKey.length === 1 &&
    typeMap[
      columns.find((column) => column.name === primaryKey[0])!.dataType
    ] === "INTEGER"
      ? primaryKey[0]
      : null;

  const definitions = columns.map((column) => {
    const sqliteType = typeMap[column.dataType];
    if (!sqliteType) {
      throw new Error(
        `Unmapped type ${column.dataType} on ${name}.${column.name}`,
      );
    }
    const parts = [quote(column.name), sqliteType];
    if (column.name === rowidAlias) {
      parts.push("PRIMARY KEY");
    } else if (!column.nullable) {
      parts.push("NOT NULL");
    }
    return parts.join(" ");
  });

  if (primaryKey.length && !rowidAlias) {
    definitions.push(`PRIMARY KEY (${primaryKey.map(quote).join(", ")})`);
  }

  if (enumChecks) {
    for (const column of columns.filter(
      (column) => column.dataType === "enum",
    )) {
      const values = enumValues(column.columnType);
      if (values.length) {
        const list = values
          .map((value) => `'${value.replaceAll("'", "''")}'`)
          .join(", ");
        definitions.push(`CHECK (${quote(column.name)} IN (${list}))`);
      }
    }
  }

  // FTS5 external-content tables address rows by rowid, so those keep theirs.
  const withoutRowid =
    primaryKey.length && !rowidAlias && !fulltextColumns.length
      ? " WITHOUT ROWID"
      : "";

  return `CREATE TABLE ${quote(name)} (${definitions.join(", ")})${withoutRowid};`;
};

export const createIndexes = (table: Table) =>
  table.indexes
    .filter(({ columns, type }) => {
      if (type === "FULLTEXT" || type === "VECTOR") return false;
      return columns.join(" ") !== table.primaryKey.join(" ");
    })
    .map(
      ({ name, columns, unique }) =>
        `CREATE ${unique ? "UNIQUE " : ""}INDEX ${quote(`${table.name}__${name}`)} ` +
        `ON ${quote(table.name)} (${columns.map(quote).join(", ")});`,
    );

export const createFtsIndex = (table: string, columns: string[]) => {
  const list = columns.map(quote).join(", ");
  return [
    `CREATE VIRTUAL TABLE ${quote(`${table}_fts`)} USING fts5(${list}, ` +
      `content=${quote(table)}, content_rowid='rowid', ` +
      `tokenize='unicode61 remove_diacritics 2');`,
    `INSERT INTO ${quote(`${table}_fts`)}(rowid, ${list}) ` +
      `SELECT rowid, ${list} FROM ${quote(table)};`,
  ];
};
