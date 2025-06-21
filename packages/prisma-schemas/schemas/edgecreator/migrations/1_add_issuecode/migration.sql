alter table tranches_en_cours_modeles
add issuecode varchar(21) default concat(
        convert(`Pays` using utf8mb3),
        '/',
        `Magazine`,
        ' ',
        `Numero`
    ) not null;
UPDATE tranches_en_cours_modeles
set issuecode = (
        select inducks_issue.issuecode
        from coa.inducks_issue
        where inducks_issue.publicationcode = CONCAT(
                tranches_en_cours_modeles.Pays,
                '/',
                tranches_en_cours_modeles.Magazine
            )
            and inducks_issue.issuenumber = tranches_en_cours_modeles.Numero
    )
where exists (
        (
            select 1
            from coa.inducks_issue
            where inducks_issue.publicationcode = CONCAT(
                    tranches_en_cours_modeles.Pays,
                    '/',
                    tranches_en_cours_modeles.Magazine
                )
                and inducks_issue.issuenumber = tranches_en_cours_modeles.Numero
        )
    );
UPDATE tranches_en_cours_modeles
set issuecode = (
        select inducks_issue.issuecode
        from coa.inducks_issue
        where inducks_issue.publicationcode = CONCAT(
                tranches_en_cours_modeles.Pays,
                '/',
                tranches_en_cours_modeles.Magazine
            )
            and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = tranches_en_cours_modeles.Numero
    )
where exists (
        (
            select 1
            from coa.inducks_issue
            where inducks_issue.publicationcode = CONCAT(
                    tranches_en_cours_modeles.Pays,
                    '/',
                    tranches_en_cours_modeles.Magazine
                )
                and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = tranches_en_cours_modeles.Numero
        )
    );
create unique index tranches_en_cours_modeles__issuecode on tranches_en_cours_modeles (issuecode, username);
optimize table tranches_en_cours_modeles;