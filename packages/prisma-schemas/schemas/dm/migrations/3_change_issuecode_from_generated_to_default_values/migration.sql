ALTER TABLE numeros DROP COLUMN issuecode;
ALTER TABLE numeros
add issuecode varchar(25) collate utf8mb3_unicode_ci null;
CREATE TRIGGER numeros_issuecode_insert BEFORE
INSERT ON numeros FOR EACH ROW BEGIN IF NEW.issuecode IS NULL
    AND EXISTS(
        select 1
        from coa.inducks_issue
        where inducks_issue.publicationcode = NEW.publicationcode
            and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = NEW.Numero
    ) THEN
set NEW.issuecode = (
        select inducks_issue.issuecode
        from coa.inducks_issue
        where inducks_issue.publicationcode = NEW.publicationcode
            and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = NEW.Numero
    );
END IF;
END;
ALTER TABLE tranches_pretes DROP COLUMN issuecode;
ALTER TABLE tranches_pretes
add issuecode varchar(25) collate utf8mb3_unicode_ci null;
CREATE TRIGGER tranches_pretes_issuecode_insert BEFORE
INSERT ON tranches_pretes FOR EACH ROW BEGIN IF NEW.issuecode IS NULL
    AND EXISTS(
        select 1
        from coa.inducks_issue
        where inducks_issue.publicationcode = NEW.publicationcode
            and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = NEW.issuenumber
    ) THEN
set NEW.issuecode = (
        select inducks_issue.issuecode
        from coa.inducks_issue
        where inducks_issue.publicationcode = NEW.publicationcode
            and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = NEW.issuenumber
    );
END IF;
END;