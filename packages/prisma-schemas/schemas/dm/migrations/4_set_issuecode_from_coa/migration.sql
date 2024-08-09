UPDATE dm.numeros
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = numeros.publicationcode
      and inducks_issue.issuenumber = numeros.Numero
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = numeros.publicationcode
        and inducks_issue.issuenumber = numeros.Numero
    )
  );
UPDATE dm.numeros
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = numeros.publicationcode
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = numeros.Numero
  )
where issuecode is null
  and exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = numeros.publicationcode
        and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = numeros.Numero
    )
  );
UPDATE dm.tranches_pretes
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = tranches_pretes.publicationcode
      and inducks_issue.issuenumber = tranches_pretes.issuenumber
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = tranches_pretes.publicationcode
        and inducks_issue.issuenumber = tranches_pretes.issuenumber
    )
  )
UPDATE dm.tranches_pretes
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = tranches_pretes.publicationcode
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = tranches_pretes.issuenumber
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = tranches_pretes.publicationcode
        and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = tranches_pretes.issuenumber
    )
  )