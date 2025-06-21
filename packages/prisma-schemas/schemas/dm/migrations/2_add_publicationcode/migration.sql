alter table numeros
add publicationcode varchar(14) default concat(
        convert(`Pays` using utf8mb3),
        '/',
        convert(`Magazine` using utf8mb3)
    ) not null
after Magazine;
create index publication_user on numeros (publicationcode, ID_Utilisateur);
optimize table numeros;