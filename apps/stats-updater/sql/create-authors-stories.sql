USE dm_stats_new;

INSERT INTO auteurs_histoires(personcode, storycode)
select distinct sj.personcode, sv.storycode
from coa.inducks_storyjob sj
       inner join coa.inducks_storyversion sv on sj.storyversioncode = sv.storyversioncode
where sv.what = 's'
  and sv.kind = 'n'
  and sj.personcode in (select distinct a_p.NomAuteurAbrege
                        from dm.auteurs_pseudos a_p)
  and exists(
  select 1
  from coa.inducks_entry e
  where e.storyversioncode = sv.storyversioncode
  );
