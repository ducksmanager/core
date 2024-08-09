CREATE TRIGGER utilisateurs_publications_manquantes_issuecode_insert BEFORE
INSERT ON utilisateurs_publications_manquantes FOR EACH ROW BEGIN IF NEW.issuecode IS NULL
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
/**/
CREATE TRIGGER utilisateurs_publications_suggerees_issuecode_insert BEFORE
INSERT ON utilisateurs_publications_suggerees FOR EACH ROW BEGIN IF NEW.issuecode IS NULL
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