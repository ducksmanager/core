export const statsTable = "inducksql_stats";

export const excludedTables = [
  "inducks_entryurl_vector",
  "_prisma_migrations",
  "inducks_issuequotation_raw",
];
export const excludedTablePrefixes = ["temp_files_to_process_", "induckspriv_"];

export const typeMap: Record<string, "TEXT" | "INTEGER" | "REAL"> = {
  varchar: "TEXT",
  char: "TEXT",
  text: "TEXT",
  tinytext: "TEXT",
  mediumtext: "TEXT",
  longtext: "TEXT",
  enum: "TEXT",
  tinyint: "INTEGER",
  smallint: "INTEGER",
  mediumint: "INTEGER",
  int: "INTEGER",
  bigint: "INTEGER",
  float: "REAL",
  double: "REAL",
  decimal: "REAL",
  date: "TEXT",
  datetime: "TEXT",
  timestamp: "TEXT",
  time: "TEXT",
};
