create or replace view duckguessr_published_fr_recent_game_all as
select distinct entryurl.id as entryurl_id,
                storyjob.personcode
from inducks_issue issue
       inner join inducks_entry entry on issue.issuecode = entry.issuecode
       inner join inducks_entryurl entryurl on entry.entrycode = entryurl.entrycode
       inner join inducks_storyversion storyversion
                  on entry.storyversioncode = storyversion.storyversioncode
       inner join inducks_story story on storyversion.storycode = story.storycode
       inner join inducks_storyjob storyjob on storyversion.storyversioncode = storyjob.storyversioncode
where issue.publicationcode IN ('fr/MP', 'fr/PM', 'fr/SPG')
  and oldestdate > '2010-00-00'
  and sitecode = 'thumbnails3'
  and kind = 'n'
  and storyjob.plotwritartink = 'a'
  and personcode <> '?';

create or replace view duckguessr_published_fr_recent_game as
select distinct row_number() over (order by entryurl.id) as id,
                entryurl.id                              as entryurl_id,
                concat(sitecode, '/', url)               as entryurl_url,
                person.personcode,
                nationalitycountrycode                   as personnationality,
                fullname                                 as personfullname
from duckguessr_published_fr_recent_game_all entryurl_ids
       inner join inducks_entryurl entryurl on entryurl_ids.entryurl_id = entryurl.id
       inner join
     (select artist_with_20_entries.personcode, nationalitycountrycode, fullname
      from duckguessr_published_fr_recent_game_all artist_with_20_entries
             inner join inducks_person person on artist_with_20_entries.personcode = person.personcode
      group by artist_with_20_entries.personcode
      having count(*) >= 20
     ) as person on person.personcode = entryurl_ids.personcode;

select * from datasets_entryurls where dataset_id=(select id from datasets where name=:datasetName) order by rand() limit @numberOfRounds_plus_1

select entryurl_url, entryurl_id.personcode, entryurl_id.personnationality, entryurl_id.personfullname
from (
       SELECT entryurl_url, personcode, personnationality, personfullname
       FROM duckguessr_published_fr_recent_game
       WHERE id >= FLOOR(RAND() * (SELECT MAX(id) FROM duckguessr_published_fr_recent_game))
       ORDER BY RAND()
       LIMIT 150
     ) as entryurl_id
       inner join duckguessr_published_fr_recent_game using (entryurl_url, personcode)
group by entryurl_id.personcode
order by RAND()
limit @numberOfRounds_plus_1;
