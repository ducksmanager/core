select distinct id                            as entryurl_id,
                concat(sitecode, '/', url)    as entryurl_url,
                person.personcode,
                person.nationalitycountrycode as personnationality,
                person.fullname               as personfullname
from (
       SELECT entrycode, url, sitecode, id
       FROM inducks_entryurl
       WHERE id >= FLOOR(RAND() * (SELECT MAX(id) FROM inducks_entryurl))
         AND sitecode = 'thumbnails3'
       ORDER BY RAND()
       LIMIT 150
     ) as entryurl
       inner join inducks_entry entry on entry.entrycode = entryurl.entrycode
       inner join inducks_storyversion storyversion
                  on entry.storyversioncode = storyversion.storyversioncode
       inner join inducks_story story on storyversion.storycode = story.storycode
       inner join inducks_storyjob storyjob on storyversion.storyversioncode = storyjob.storyversioncode
       inner join inducks_person person on storyjob.personcode = person.personcode
where storyjob.plotwritartink = 'a'
  and person.personcode <> '?'
  and person.nationalitycountrycode = 'us'
group by person.personcode
order by RAND()
limit @numberOfRounds_plus_1
