create index inducks_issue_publicationcode_issuenumber_index
    on inducks_issue (publicationcode, issuenumber);

OPTIMIZE table inducks_issue;