create table edgecreator_intervalles
(
    ID           int auto_increment
        primary key,
    ID_Valeur    int(10)     not null,
    Numero_debut varchar(10) not null,
    Numero_fin   varchar(10) not null,
    username     varchar(25) not null
)
    engine = MyISAM
    collate = latin1_german2_ci;

create index index_intervalles
    on edgecreator_intervalles (ID_Valeur, Numero_debut, Numero_fin, username);

create table edgecreator_modeles2
(
    ID           int auto_increment
        primary key,
    Pays         varchar(3)  not null,
    Magazine     varchar(6)  not null,
    Ordre        int         not null,
    Nom_fonction varchar(30) not null,
    Option_nom   varchar(20) null
)
    engine = MyISAM
    collate = latin1_german2_ci;

create table edgecreator_valeurs
(
    ID            int(10) auto_increment
        primary key,
    ID_Option     int(10)      null,
    Option_valeur varchar(200) null
)
    engine = MyISAM
    collate = latin1_german2_ci;

create index edgecreator_valeurs_edgecreator_modeles2_ID_fk
    on edgecreator_valeurs (ID_Option);

create table images_myfonts
(
    ID         int auto_increment
        primary key,
    Font       varchar(150) null,
    Color      varchar(10)  null,
    ColorBG    varchar(10)  null,
    Width      varchar(7)   null,
    Texte      varchar(150) null,
    Precision_ varchar(5)   null
);

create table images_tranches
(
    ID             int auto_increment
        primary key,
    ID_Utilisateur int          null,
    Hash           varchar(40)  null,
    DateHeure      datetime     null,
    NomFichier     varchar(255) not null,
    constraint images_tranches_Hash_uindex
        unique (Hash)
);

create table tranches_en_cours_modeles
(
    ID                 int auto_increment
        primary key,
    Pays               varchar(3)  not null,
    Magazine           varchar(6)  not null,
    Numero             varchar(10) not null,
    username           varchar(25) null,
    NomPhotoPrincipale varchar(60) null,
    photographes       text        null,
    createurs          text        null,
    Active             tinyint(1)  not null,
    constraint tranches_en_cours_modeles__numero
        unique (Pays, Magazine, Numero, username)
);

create table tranches_en_cours_contributeurs
(
    ID             int auto_increment
        primary key,
    ID_Modele      int                              null,
    ID_Utilisateur int                              not null,
    contribution   enum ('photographe', 'createur') not null,
    constraint tranches_en_cours_contributeurs__unique
        unique (ID_Modele, ID_Utilisateur, contribution),
    constraint tranches_en_cours_contributeurs_tranches_en_cours_modeles_ID_fk
        foreign key (ID_Modele) references tranches_en_cours_modeles (ID)
)
    charset = latin1;

create table tranches_en_cours_modeles_images
(
    ID                 int auto_increment
        primary key,
    ID_Modele          int        not null,
    ID_Image           int        not null,
    EstPhotoPrincipale tinyint(1) not null,
    constraint tranches_en_cours_modeles_images___fk_image
        foreign key (ID_Image) references images_tranches (ID),
    constraint tranches_en_cours_modeles_images___modele
        foreign key (ID_Modele) references tranches_en_cours_modeles (ID)
)
    charset = latin1;

create table tranches_en_cours_valeurs
(
    ID            int auto_increment
        primary key,
    Ordre         double       not null,
    Nom_fonction  varchar(30)  not null,
    Option_nom    varchar(30)  null,
    Option_valeur varchar(200) null,
    ID_Modele     int          null,
    constraint FK_AC57D99E4A1ED576
        foreign key (ID_Modele) references tranches_en_cours_modeles (ID)
);

create index ID_Modele
    on tranches_en_cours_valeurs (ID_Modele);

create table users
(
    ID                         int auto_increment
        primary key,
    username                   varchar(25) not null,
    password                   varchar(40) not null,
    AccepterPartage            tinyint(1)  not null,
    DateInscription            datetime    not null,
    EMail                      varchar(50) not null,
    RecommandationsListeMags   tinyint(1)  not null,
    BetaUser                   tinyint(1)  not null,
    AfficherVideo              tinyint(1)  not null,
    Bibliotheque_Texture1      varchar(20) not null,
    Bibliotheque_Sous_Texture1 varchar(50) not null,
    Bibliotheque_Texture2      varchar(20) not null,
    Bibliotheque_Sous_Texture2 varchar(50) not null,
    Bibliotheque_Grossissement double      not null,
    DernierAcces               datetime    not null,
    constraint username
        unique (username)
)
    charset = latin1;

create definer = root@`%` view tranches_en_cours_modeles_vue as
select `edgecreator`.`tranches_en_cours_modeles`.`username`      AS `username`,
       `edgecreator`.`tranches_en_cours_modeles`.`Pays`          AS `Pays`,
       `edgecreator`.`tranches_en_cours_modeles`.`Magazine`      AS `Magazine`,
       `edgecreator`.`tranches_en_cours_modeles`.`Active`        AS `Active`,
       `edgecreator`.`tranches_en_cours_modeles`.`Numero`        AS `Numero`,
       `edgecreator`.`tranches_en_cours_valeurs`.`Ordre`         AS `Ordre`,
       `edgecreator`.`tranches_en_cours_valeurs`.`Nom_fonction`  AS `Nom_fonction`,
       `edgecreator`.`tranches_en_cours_valeurs`.`Option_nom`    AS `Option_nom`,
       `edgecreator`.`tranches_en_cours_valeurs`.`Option_valeur` AS `Option_valeur`,
       `edgecreator`.`tranches_en_cours_valeurs`.`ID_Modele`     AS `ID_Modele`,
       `edgecreator`.`tranches_en_cours_valeurs`.`ID`            AS `ID_Valeur`
from (`edgecreator`.`tranches_en_cours_modeles` join `edgecreator`.`tranches_en_cours_valeurs`
      on (`edgecreator`.`tranches_en_cours_modeles`.`ID` = `edgecreator`.`tranches_en_cours_valeurs`.`ID_Modele`))
order by `edgecreator`.`tranches_en_cours_modeles`.`Pays`, `edgecreator`.`tranches_en_cours_modeles`.`Magazine`,
         `edgecreator`.`tranches_en_cours_valeurs`.`Ordre`, `edgecreator`.`tranches_en_cours_valeurs`.`Nom_fonction`,
         `edgecreator`.`tranches_en_cours_valeurs`.`Option_nom`,
         `edgecreator`.`tranches_en_cours_valeurs`.`Option_valeur`;

