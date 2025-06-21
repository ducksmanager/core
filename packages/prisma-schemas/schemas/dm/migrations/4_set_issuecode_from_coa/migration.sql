UPDATE numeros
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
UPDATE numeros
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
/**/
UPDATE tranches_pretes
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = tranches_pretes.publicationcode
      and inducks_issue.issuenumber = tranches_pretes.issuenumber
  )
where issuecode IS NULL
  and exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = tranches_pretes.publicationcode
        and inducks_issue.issuenumber = tranches_pretes.issuenumber
    )
  );
UPDATE tranches_pretes
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = tranches_pretes.publicationcode
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = tranches_pretes.issuenumber
  )
where issuecode IS NULL
  and exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = tranches_pretes.publicationcode
        and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = tranches_pretes.issuenumber
    )
  );
/**/
UPDATE abonnements_sorties
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = CONCAT(
        abonnements_sorties.Pays,
        '/',
        abonnements_sorties.Magazine
      )
      and inducks_issue.issuenumber = abonnements_sorties.Numero
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = CONCAT(
          abonnements_sorties.Pays,
          '/',
          abonnements_sorties.Magazine
        )
        and inducks_issue.issuenumber = abonnements_sorties.Numero
    )
  );
UPDATE abonnements_sorties
set issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = CONCAT(
        abonnements_sorties.Pays,
        '/',
        abonnements_sorties.Magazine
      )
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = abonnements_sorties.Numero
  )
where exists (
    (
      select 1
      from coa.inducks_issue
      where inducks_issue.publicationcode = CONCAT(
          abonnements_sorties.Pays,
          '/',
          abonnements_sorties.Magazine
        )
        and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = abonnements_sorties.Numero
    )
  );