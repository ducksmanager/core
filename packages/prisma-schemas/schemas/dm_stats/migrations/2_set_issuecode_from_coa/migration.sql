UPDATE utilisateurs_publications_manquantes
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = utilisateurs_publications_manquantes.publicationcode
      and inducks_issue.issuenumber = utilisateurs_publications_manquantes.issuenumber
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = utilisateurs_publications_manquantes.publicationcode
        and inducks_issue.issuenumber = utilisateurs_publications_manquantes.issuenumber
    )
  );
UPDATE utilisateurs_publications_manquantes
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = utilisateurs_publications_manquantes.publicationcode
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = utilisateurs_publications_manquantes.issuenumber
  )
where issuecode is null
  and exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = utilisateurs_publications_manquantes.publicationcode
        and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = utilisateurs_publications_manquantes.issuenumber
    )
  );
/**/
UPDATE utilisateurs_publications_suggerees
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = utilisateurs_publications_suggerees.publicationcode
      and inducks_issue.issuenumber = utilisateurs_publications_suggerees.issuenumber
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = utilisateurs_publications_suggerees.publicationcode
        and inducks_issue.issuenumber = utilisateurs_publications_suggerees.issuenumber
    )
  );
UPDATE utilisateurs_publications_suggerees
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = utilisateurs_publications_suggerees.publicationcode
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = utilisateurs_publications_suggerees.issuenumber
  )
where issuecode is null
  and exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = utilisateurs_publications_suggerees.publicationcode
        and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = utilisateurs_publications_suggerees.issuenumber
    )
  );