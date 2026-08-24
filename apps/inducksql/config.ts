export const statsTable = "inducksql_stats";

export const excludedTables = [
  "inducks_entryurl_vector",
  "_prisma_migrations",
  "inducks_issuequotation_raw",
];
export const excludedTablePrefixes = ["temp_files_to_process_", "induckspriv_"];

/** `remove_diacritics 2` reproduces the source's accent-insensitive collation. */
export const ftsIndexes: Record<string, string[]> = {
  inducks_entry: ["title"],
  inducks_character: ["charactername"],
  inducks_person: ["fullname", "birthname"],
  inducks_publication: ["title"],
  inducks_publisher: ["publishername"],
  inducks_story: ["storycode"],
};

/**
 * The `fk*` indexes are most of the artifact's size, but dropping them turns the joins they
 * serve into full table scans, which over a range-request VFS means fetching whole tables.
 */
export const skipIndexPattern: RegExp | null = null;

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
