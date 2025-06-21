SELECT 
  id,
  concat(
    'https://outducks.org/',
    sitecode,
    '/',
    case sitecode when 'webusers' then 'webusers/' else '' end,
    url
  ) as fullurl 
FROM covers
LEFT JOIN cover_imports on covers.id = cover_imports.coverid
WHERE cover_imports.coverid IS NULL
LIMIT _IMAGES_PER_GROUP_
OFFSET _COVER_OFFSET_