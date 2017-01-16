select distinct sv.storycode, i.publicationcode, i.issuenumber
  from coa.inducks_storyjob sj
    inner join coa.inducks_storyversion sv on sj.storyversioncode = sv.storyversioncode
    inner join coa.inducks_entry e on sj.storyversioncode = e.storyversioncode
    inner join coa.inducks_issue i on e.issuecode = i.issuecode
  where sj.personcode in (
    select distinct a_p.NomAuteurAbrege
    from dm_stats.auteurs_pseudos_simple a_p
  );