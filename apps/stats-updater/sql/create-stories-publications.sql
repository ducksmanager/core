USE dm_stats_new;

INSERT INTO histoires_publications
  (storycode, publicationcode, issuenumber, issuecode, oldestdate)
select distinct sv.storycode,
                i.publicationcode,
                i.issuenumber,
                CONCAT(i.publicationcode, ' ', i.issuenumber),
                IF(i.oldestdate regexp '^\\d+(-\\d+(-\\d+)?)?$', STR_TO_DATE(i.oldestdate, '%Y-%m-%d'), '0001-01-01')
from coa.inducks_storyjob sj
       inner join coa.inducks_storyversion sv on sj.storyversioncode = sv.storyversioncode
       inner join coa.inducks_entry e on sj.storyversioncode = e.storyversioncode
       inner join coa.inducks_issue i on e.issuecode = i.issuecode
where sj.personcode in (select distinct a_p.NomAuteurAbrege
                        from dm.auteurs_pseudos a_p)
