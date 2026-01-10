SELECT id,
  concat(
    '/data/covers/',
    sitecode,
    '/',
    case
      sitecode
      when 'webusers' then 'webusers/'
      else ''
    end,
    url
  ) as path
FROM covers
  LEFT JOIN cover_imports on covers.id = cover_imports.coverid
WHERE cover_imports.coverid IS NULL
LIMIT _IMAGES_PER_GROUP_ OFFSET _COVER_OFFSET_