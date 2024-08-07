create index issuecode_creationdate on dm.numeros (issuecode, DateAjout);
create index issuecode_user on dm.numeros (issuecode, ID_Utilisateur);
alter table numeros_popularite
add issuecode varchar(25) default concat(
        convert(`Pays` using utf8mb3),
        '/',
        convert(`Magazine` using utf8mb3),
        ' ',
        `Numero`
    ) not null;
create index numeros_popularite_issuecode_unique on dm.numeros_popularite (issuecode);
alter table abonnements_sorties
add issuecode varchar(25) default concat(
        convert(`Pays` using utf8mb3),
        '/',
        convert(`Magazine` using utf8mb3),
        ' ',
        `Numero`
    ) not null;
create index abonnements_sorties_issuecode_unique on dm.abonnements_sorties (issuecode);