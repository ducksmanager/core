CREATE TRIGGER tranches_en_cours_modeles_issuecode_insert BEFORE
INSERT ON tranches_en_cours_modeles FOR EACH ROW BEGIN IF NEW.issuecode IS NULL
  AND EXISTS(
    select 1
    from coa.inducks_issue
    where inducks_issue.publicationcode = CONCAT(NEW.Pays, '/', NEW.Magazine)
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = NEW.Numero
  ) THEN
set NEW.issuecode = (
    select inducks_issue.issuecode
    from coa.inducks_issue
    where inducks_issue.publicationcode = CONCAT(NEW.Pays, '/', NEW.Magazine)
      and REGEXP_REPLACE(inducks_issue.issuenumber, ' +', ' ') = NEW.Numero
  );
END IF;
END;