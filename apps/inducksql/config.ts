/** Tables never worth shipping: the vector index needs sqlite-vec, the rest is build residue. */
export const excludedTables = ["inducks_entryurl_vector", "_prisma_migrations"];
export const excludedTablePrefixes = ["temp_files_to_process_"];

/**
 * FULLTEXT indexes have no SQLite counterpart, so the ones worth keeping are rebuilt as FTS5.
 * `remove_diacritics 2` reproduces the accent-insensitivity of the source's utf8mb3_unicode_ci
 * collation, which plain SQLite comparisons do not have.
 */
export const ftsIndexes: Record<string, string[]> = {
  inducks_entry: ["title"],
  inducks_character: ["charactername"],
  inducks_person: ["fullname", "birthname"],
  inducks_publication: ["title"],
  inducks_publisher: ["publishername"],
  inducks_story: ["storycode"],
};

/**
 * MariaDB index names in the INDUCKS schema are positional (`fk0`, `pk0`, ...). They are all
 * kept by default: the `fk*` ones account for a large part of the artifact's size, but dropping
 * them turns the join paths they serve into full table scans, which over a range-request VFS
 * means pulling whole tables across the network.
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
  // Dates become ISO-8601 text: lexically sortable and accepted by SQLite's date functions.
  date: "TEXT",
  datetime: "TEXT",
  timestamp: "TEXT",
  time: "TEXT",
};
