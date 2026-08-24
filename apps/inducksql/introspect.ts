import type { Pool } from "mariadb";

import { excludedTablePrefixes, excludedTables } from "./config";

export type Column = {
  name: string;
  dataType: string;
  columnType: string;
  nullable: boolean;
  autoIncrement: boolean;
};

export type Index = {
  name: string;
  columns: string[];
  unique: boolean;
  type: string;
};

export type Table = {
  name: string;
  columns: Column[];
  primaryKey: string[];
  indexes: Index[];
};

/**
 * Only BASE TABLEs are read, so the schema's views are excluded by construction. They rely on
 * `regexp` and `CAST(... AS UNSIGNED)` and would need rewriting to run under SQLite anyway.
 */
export const introspect = async (
  pool: Pool,
  database: string,
): Promise<Table[]> => {
  const tableRows: { TABLE_NAME: string }[] = await pool.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME`,
    [database],
  );
  const names = tableRows
    .map(({ TABLE_NAME }) => TABLE_NAME)
    .filter(
      (name) =>
        !excludedTables.includes(name) &&
        !excludedTablePrefixes.some((prefix) => name.startsWith(prefix)),
    );

  const columnRows: {
    TABLE_NAME: string;
    COLUMN_NAME: string;
    DATA_TYPE: string;
    COLUMN_TYPE: string;
    IS_NULLABLE: string;
    EXTRA: string;
  }[] = await pool.query(
    `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, EXTRA
     FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    [database],
  );

  const indexRows: {
    TABLE_NAME: string;
    INDEX_NAME: string;
    NON_UNIQUE: number | bigint;
    COLUMN_NAME: string;
    INDEX_TYPE: string;
    SUB_PART: number | null;
  }[] = await pool.query(
    `SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE, COLUMN_NAME, INDEX_TYPE, SUB_PART
     FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ?
     ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX`,
    [database],
  );

  const prefixed = indexRows.filter(({ SUB_PART }) => SUB_PART !== null);
  if (prefixed.length) {
    // SQLite cannot index a prefix of a column, so this would silently change query plans.
    console.warn(
      `Warning: ignoring ${prefixed.length} prefix index part(s) with no SQLite equivalent`,
    );
  }

  return names.map((name) => {
    const columns = columnRows
      .filter((row) => row.TABLE_NAME === name)
      .map((row): Column => ({
        name: row.COLUMN_NAME,
        dataType: row.DATA_TYPE,
        columnType: row.COLUMN_TYPE,
        nullable: row.IS_NULLABLE === "YES",
        autoIncrement: row.EXTRA.includes("auto_increment"),
      }));

    const byIndex = new Map<string, typeof indexRows>();
    for (const row of indexRows.filter((row) => row.TABLE_NAME === name)) {
      byIndex.set(row.INDEX_NAME, [
        ...(byIndex.get(row.INDEX_NAME) ?? []),
        row,
      ]);
    }

    const indexes: Index[] = [];
    let primaryKey: string[] = [];
    for (const [indexName, rows] of byIndex) {
      const columnNames = rows.map(({ COLUMN_NAME }) => COLUMN_NAME);
      if (indexName === "PRIMARY") {
        primaryKey = columnNames;
      } else {
        indexes.push({
          name: indexName,
          columns: columnNames,
          unique: Number(rows[0].NON_UNIQUE) === 0,
          type: rows[0].INDEX_TYPE,
        });
      }
    }

    return { name, columns, primaryKey, indexes };
  });
};
