  SELECT distinct entry.issuecode, eu.sitecode, eu.url
  FROM inducks_entry entry
  INNER JOIN
  (
    SELECT DISTINCT eu.entrycode, eu.sitecode, eu.url
    FROM inducks_entryurl eu
    WHERE eu.sitecode NOT LIKE 'thumbnails%'
  ) eu
    ON entry.entrycode = eu.entrycode
  WHERE entry.position =
    (
      SELECT MIN(position)
      FROM inducks_entry e
      WHERE entry.issuecode = e.issuecode
      GROUP BY e.issuecode
    )
  AND issuecode != '';