alter table tranches_en_cours_modeles
    add issuecode varchar(21) default concat(convert(`Pays` using utf8mb3), '/',
                                             `Magazine`, ' ',
                                             `Numero`) not null;

create unique index tranches_en_cours_modeles__issuecode
    on edgecreator.tranches_en_cours_modeles (issuecode, username);
