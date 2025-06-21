create index issuecode_creationdate on numeros (issuecode, DateAjout);
create index issuecode_user on numeros (issuecode, ID_Utilisateur);
OPTIMIZE TABLE numeros;
/**/
alter table abonnements_sorties
add issuecode varchar(25) default concat(
        convert(`Pays` using utf8mb3),
        '/',
        convert(`Magazine` using utf8mb3),
        ' ',
        `Numero`
    ) not null;
create index abonnements_sorties_issuecode_unique on abonnements_sorties (issuecode);
OPTIMIZE TABLE abonnements_sorties;