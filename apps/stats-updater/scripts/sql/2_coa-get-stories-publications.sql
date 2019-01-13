select distinct sv.storycode, i.publicationcode, i.issuenumber
  from inducks_storyjob sj
    inner join inducks_storyversion sv on sj.storyversioncode = sv.storyversioncode
    inner join inducks_entry e on sj.storyversioncode = e.storyversioncode
    inner join inducks_issue i on e.issuecode = i.issuecode
  where sj.personcode in (
    select distinct a_p.NomAuteurAbrege
    from MYSQL_DM_STATS_DATABASE_new.auteurs_pseudos a_p
  );
