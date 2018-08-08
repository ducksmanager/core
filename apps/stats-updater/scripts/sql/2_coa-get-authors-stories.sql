select distinct sj.personcode, sv.storycode
  from inducks_storyjob sj
    inner join inducks_storyversion sv on sj.storyversioncode = sv.storyversioncode
  where sv.what='s'
    and sv.kind='n'
    and sj.personcode in (
      select distinct a_p.NomAuteurAbrege
      from dm_stats_new.auteurs_pseudos_simple a_p
    )
    and exists (
      select 1
      from inducks_entry e
      where e.storyversioncode = sv.storyversioncode
    );
