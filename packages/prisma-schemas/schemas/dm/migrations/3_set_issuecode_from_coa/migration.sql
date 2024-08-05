UPDATE dm.numeros
set issuecode = (select inducks_issue.issuecode
                 from coa.inducks_issue
                 where inducks_issue.publicationcode = numeros.publicationcode
                   and inducks_issue.issuenumber = numeros.Numero)
where exists ((select 1
               from coa.inducks_issue
               where inducks_issue.publicationcode = numeros.publicationcode
                 and inducks_issue.issuenumber = numeros.Numero))