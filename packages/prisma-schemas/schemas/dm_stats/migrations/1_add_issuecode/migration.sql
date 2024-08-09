alter table utilisateurs_publications_manquantes
add issuecode varchar(25) null
after issuenumber;
create index missing_user_issue_issuecode on utilisateurs_publications_manquantes (ID_User, issuecode);
create index suggested_issuecode on utilisateurs_publications_manquantes (ID_User, issuecode, oldestdate);
create unique index unique_index_issuecode on utilisateurs_publications_manquantes (ID_User, personcode, storycode, issuecode);
/**/
alter table utilisateurs_publications_suggerees
add issuecode varchar(25) null
after issuenumber;
alter table utilisateurs_publications_suggerees
add constraint suggested_issue_for_user_issuecode unique (ID_User, issuecode);