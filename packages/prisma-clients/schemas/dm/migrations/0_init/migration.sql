create table abonnements_sorties
(
    Pays            varchar(3)           not null,
    Magazine        varchar(6)           not null,
    Numero          varchar(8)           not null,
    Date_sortie     date                 not null,
    Numeros_ajoutes tinyint(1) default 0 not null,
    primary key (Pays, Magazine, Numero)
)
    charset = latin1;

create table achats
(
    ID_Acquisition int auto_increment
        primary key,
    ID_User        int          not null,
    Date           date         not null,
    Description    varchar(100) not null,
    constraint user_date_description_unique
        unique (ID_User, Date, Description)
)
    engine = MyISAM
    charset = latin1;

create table auteurs_pseudos
(
    ID              int auto_increment
        primary key,
    NomAuteurAbrege varchar(79) charset latin1 not null,
    ID_user         int                        not null,
    Notation        int(4) default -1          not null,
    constraint auteurs_pseudos_uindex
        unique (ID_user, NomAuteurAbrege)
)
    engine = MyISAM
    collate = utf8mb3_bin
    row_format = DYNAMIC;

create table bibliotheque_contributeurs
(
    ID    int auto_increment
        primary key,
    Nom   varchar(30) null,
    Texte text        null
)
    engine = MyISAM
    collate = latin1_german2_ci;

create table bibliotheque_ordre_magazines
(
    ID              int auto_increment
        primary key,
    ID_Utilisateur  int         not null,
    publicationcode varchar(12) not null,
    Ordre           int(3)      not null,
    constraint bibliotheque_ordre_magazines_uindex
        unique (ID_Utilisateur, publicationcode)
)
    engine = MyISAM
    collate = latin1_german2_ci;

create table bouquineries
(
    ID              int auto_increment
        primary key,
    Nom             varchar(30) charset latin1 not null,
    AdresseComplete text                       not null,
    CoordX          double                     not null,
    CoordY          double                     not null
)
    charset = utf8mb3;

create table demo
(
    ID              int default 1 not null
        primary key,
    DateDernierInit datetime      not null
)
    engine = MyISAM
    collate = latin1_german2_ci;

create table magazines
(
    PaysAbrege     varchar(4) charset latin1 not null,
    NomAbrege      varchar(7) charset latin1 not null,
    NomComplet     varchar(70)               not null,
    RedirigeDepuis varchar(7)                not null,
    NeParaitPlus   tinyint(1)                null,
    primary key (PaysAbrege, NomAbrege, RedirigeDepuis)
)
    engine = MyISAM
    collate = utf8mb3_bin;

create table numeros
(
    ID              int auto_increment
        primary key,
    Pays            varchar(3)                                                               not null,
    Magazine        varchar(10)                                                              not null,
    Numero          varchar(12) collate utf8mb3_bin                                          not null,
    Numero_nospace  varchar(12) as (replace(`Numero`, ' ', '')),
    Etat            enum ('mauvais', 'moyen', 'bon', 'indefini') default 'indefini'          not null,
    ID_Acquisition  int                                          default -1                  null,
    AV              tinyint(1)                                                               not null,
    A_Lire          tinyint                                      default 0                   not null,
    Abonnement      tinyint                                      default 0                   not null,
    ID_Utilisateur  int                                                                      not null,
    DateAjout       timestamp                                    default current_timestamp() null,
    issuecode       varchar(25) collate utf8mb3_unicode_ci as (concat(convert(`Pays` using utf8mb3), '/',
                                                                      convert(`Magazine` using utf8mb3), ' ',
                                                                      `Numero`)),
    short_issuecode varchar(25) collate utf8mb3_unicode_ci as (concat(convert(`Pays` using utf8mb3), '/',
                                                                      convert(`Magazine` using utf8mb3), ' ', `Numero`))
)
    engine = MyISAM
    collate = latin1_german2_ci;

create index Numero_Utilisateur
    on numeros (Pays, Magazine, Numero, ID_Utilisateur);

create index Numero_nospace_Utilisateur
    on numeros (Pays, Magazine, Numero_nospace, ID_Utilisateur);

create index Pays_Magazine_Numero
    on numeros (Pays, Magazine, Numero);

create index Pays_Magazine_Numero_DateAjout
    on numeros (DateAjout, Pays, Magazine, Numero);

create index Utilisateur
    on numeros (ID_Utilisateur);

create index numeros_issuecode_index
    on numeros (issuecode);

create index numeros_short_issuecode_index
    on numeros (short_issuecode);

create table numeros_popularite
(
    Pays       varchar(3)  not null,
    Magazine   varchar(6)  not null,
    Numero     varchar(12) not null,
    Popularite int         not null,
    ID         int auto_increment
        primary key,
    constraint numeros_popularite_unique
        unique (Pays, Magazine, Numero)
)
    engine = MyISAM
    charset = utf8mb3;

create table tranches_doublons
(
    ID               int auto_increment
        primary key,
    Pays             varchar(3)  not null,
    Magazine         varchar(6)  not null,
    Numero           varchar(12) not null,
    NumeroReference  varchar(12) not null,
    TrancheReference int         null,
    constraint tranches_doublons_Pays_Magazine_Numero_uindex
        unique (Pays, Magazine, Numero)
)
    engine = MyISAM
    collate = latin1_german2_ci;

create index tranches_doublons_tranches_pretes_ID_fk
    on tranches_doublons (TrancheReference);

create table tranches_pretes
(
    ID              int auto_increment
        primary key,
    publicationcode varchar(12)                           not null,
    issuenumber     varchar(12)                           not null,
    dateajout       timestamp default current_timestamp() not null,
    points          int                                   null,
    slug            varchar(30) as (concat('edges-', replace(`publicationcode`, '/', '-'), '-', `issuenumber`)),
    issuecode       varchar(23) as (concat(`publicationcode`, ' ', `issuenumber`)),
    short_issuecode varchar(23) as (concat(`publicationcode`, ' ', `issuenumber`)),
    constraint tranches_pretes_issuecode_uindex
        unique (issuecode),
    constraint tranches_pretes_short_issuecode_uindex
        unique (short_issuecode),
    constraint tranchespretes_unique
        unique (publicationcode, issuenumber)
)
    collate = latin1_german2_ci;

create index tranches_pretes_dateajout_index
    on tranches_pretes (dateajout);

create table tranches_pretes_contributeurs
(
    publicationcode varchar(15)                                         not null,
    issuenumber     varchar(30)                                         not null,
    contributeur    int                                                 not null,
    contribution    enum ('photographe', 'createur') default 'createur' not null,
    primary key (publicationcode, issuenumber, contributeur, contribution)
)
    engine = MyISAM
    charset = utf8mb3;

create index tranches_pretes_contributeurs_contributeur_index
    on tranches_pretes_contributeurs (contributeur);

create index tranches_pretes_contributeurs_publicationcode_issuenumber_index
    on tranches_pretes_contributeurs (publicationcode, issuenumber);

create table tranches_pretes_contributions
(
    ID           int auto_increment
        primary key,
    ID_tranche   int                                   not null,
    ID_user      int                                   not null,
    dateajout    timestamp default current_timestamp() not null on update current_timestamp(),
    contribution enum ('photographe', 'createur')      not null,
    points_new   int                                   not null,
    points_total int                                   not null
)
    charset = latin1;

create index tranches_pretes_contributions_ID_user_contribution_index
    on tranches_pretes_contributions (ID_user, contribution);

create table tranches_pretes_sprites
(
    ID          int auto_increment
        primary key,
    ID_Tranche  int         not null,
    Sprite_name varchar(25) not null,
    Sprite_size int         null,
    constraint tranches_pretes_sprites_unique
        unique (ID_Tranche, Sprite_name)
)
    engine = MyISAM
    charset = latin1;

create table tranches_pretes_sprites_size
(
    ID          int auto_increment
        primary key,
    sprite_name varchar(25) null,
    size        int         null
)
    charset = latin1;

create table tranches_pretes_sprites_urls
(
    ID          int auto_increment
        primary key,
    Sprite_name varchar(25) not null,
    Version     varchar(12) not null,
    constraint tranches_pretes_sprites_urls_unique
        unique (Sprite_name, Version)
)
    charset = latin1;

create table users
(
    ID                           int auto_increment
        primary key,
    username                     varchar(25) collate utf8mb3_bin                        not null,
    password                     varchar(40) charset latin1                             not null,
    AccepterPartage              tinyint(1)                 default 1                   not null,
    DateInscription              date                                                   not null,
    EMail                        varchar(50) charset latin1                             not null,
    ID_Discord                   varchar(20)                                            null,
    RecommandationsListeMags     tinyint(1)                 default 1                   not null,
    BetaUser                     tinyint(1)                 default 0                   not null,
    AfficherVideo                tinyint(1)                 default 1                   not null,
    Bibliotheque_AfficherDoubles tinyint(1)                 default 1                   not null,
    Bibliotheque_Texture1        varchar(20) charset latin1 default 'bois'              not null,
    Bibliotheque_Sous_Texture1   varchar(50) charset latin1 default 'HONDURAS MAHOGANY' not null,
    Bibliotheque_Texture2        varchar(20) charset latin1 default 'bois'              not null,
    Bibliotheque_Sous_Texture2   varchar(50) charset latin1 default 'KNOTTY PINE'       not null,
    TextePresentation            varchar(100)                                           null,
    MarketplaceAccepteEchanges   tinyint(1)                 default 0                   not null,
    DernierAcces                 datetime                                               null,
    PrecedentAcces               datetime                                               null,
    constraint username
        unique (username)
)
    collate = latin1_german2_ci;

create table abonnements
(
    ID             int auto_increment
        primary key,
    ID_Utilisateur int        not null,
    Pays           varchar(3) not null,
    Magazine       varchar(6) not null,
    Date_debut     date       not null,
    Date_fin       date       not null,
    constraint abonnements_unique
        unique (Pays, Magazine, ID_Utilisateur, Date_debut, Date_fin),
    constraint abonnements_users_ID_fk
        foreign key (ID_Utilisateur) references users (ID)
            on update cascade on delete cascade
)
    charset = latin1;

create table bouquineries_commentaires
(
    ID             int auto_increment
        primary key,
    ID_Utilisateur int                                    null,
    Commentaire    text collate utf8mb4_unicode_ci        not null,
    DateAjout      timestamp  default current_timestamp() not null,
    Actif          tinyint(1) default 0                   not null,
    ID_Bouquinerie int                                    not null,
    constraint bouquineries_commentaires_bouquineries_ID_fk
        foreign key (ID_Bouquinerie) references bouquineries (ID),
    constraint bouquineries_commentaires_users_ID_fk
        foreign key (ID_Utilisateur) references users (ID)
)
    charset = utf8mb3;

create table numeros_demandes
(
    ID          int auto_increment
        primary key,
    ID_Numero   int        not null,
    ID_Acheteur int        not null,
    est_reserve tinyint(1) not null,
    constraint numeros_demandes_unique
        unique (ID_Numero, ID_Acheteur),
    constraint numeros_demandes_users_null_fk
        foreign key (ID_Acheteur) references users (ID)
);

create table users_contributions
(
    ID                   int auto_increment
        primary key,
    ID_user              int                                     not null,
    date                 datetime default current_timestamp()    not null,
    contribution         varchar(255) collate utf8mb4_unicode_ci not null,
    points_new           int                                     not null,
    points_total         int                                     not null,
    emails_sent          tinyint(1)                              not null,
    ID_tranche           int                                     null,
    ID_bookstore         int                                     null,
    ID_bookstore_comment int                                     null,
    constraint FK_7FDC16F375567043
        foreign key (ID_tranche) references tranches_pretes (ID),
    constraint FK_7FDC16F3A5778B6C
        foreign key (ID_bookstore) references bouquineries (ID),
    constraint users_contributions___fk_user
        foreign key (ID_user) references users (ID),
    constraint users_contributions_bouquineries_commentaires_ID_fk
        foreign key (ID_bookstore_comment) references bouquineries_commentaires (ID)
)
    collate = latin1_german2_ci;

create index IDX_7FDC16F375567043
    on users_contributions (ID_tranche);

create index IDX_7FDC16F3A5778B6C
    on users_contributions (ID_bookstore);

create index users_contributions__user_contribution
    on users_contributions (ID_user, contribution);

create table users_options
(
    ID            int auto_increment
        primary key,
    ID_User       int                                                                                                        not null,
    Option_nom    enum ('suggestion_notification_country', 'sales_notification_publications', 'marketplace_contact_methods') not null,
    Option_valeur varchar(50)                                                                                                not null,
    constraint users_options__unique
        unique (ID_User, Option_nom, Option_valeur),
    constraint users_options_users_ID_fk
        foreign key (ID_User) references users (ID)
)
    collate = latin1_german2_ci;

create index users_options__user_option
    on users_options (ID_User, Option_nom);

create table users_password_tokens
(
    ID      int auto_increment
        primary key,
    ID_User int          not null,
    Token   varchar(256) not null,
    constraint users_password_tokens_unique
        unique (ID_User, Token)
);

create table users_permissions
(
    ID        int auto_increment
        primary key,
    username  varchar(25)                            not null,
    role      varchar(20)                            not null,
    privilege enum ('Admin', 'Edition', 'Affichage') not null,
    constraint permission_username_role
        unique (username, role, privilege)
)
    engine = MyISAM
    collate = latin1_german2_ci;

create table users_points
(
    ID               int auto_increment
        primary key,
    ID_Utilisateur   int                                            not null,
    TypeContribution enum ('photographe', 'createur', 'duckhunter') not null,
    NbPoints         int default 0                                  null
)
    charset = latin1;

create table users_suggestions_notifications
(
    ID              int auto_increment
        primary key,
    ID_User         int(10)                              not null,
    issuecode       varchar(12)                          not null,
    short_issuecode varchar(12)                          not null,
    text            text                                 null,
    date            datetime default current_timestamp() null,
    constraint users_notifications__index_user_issue
        unique (ID_User, issuecode)
)
    charset = latin1;

create
    definer = root@`%` procedure generate_sprite_names()
BEGIN
    TRUNCATE tranches_pretes_sprites;
    INSERT INTO tranches_pretes_sprites(ID_Tranche, Sprite_name, Sprite_size)
    SELECT tp.ID,
           get_sprite_name(tp.publicationcode, 'full'),
           (SELECT COUNT(*) FROM tranches_pretes tp2 where tp2.publicationcode = tp.publicationcode)
    FROM tranches_pretes tp;
    INSERT INTO tranches_pretes_sprites(ID_Tranche, Sprite_name, Sprite_size)
    SELECT tp.ID, get_sprite_name(tp.publicationcode, get_sprite_range(tp.issuenumber, 10)), 10
    from tranches_pretes tp
    WHERE tp.issuenumber regexp '^[0-9]+$';
    INSERT INTO tranches_pretes_sprites(ID_Tranche, Sprite_name, Sprite_size)
    SELECT tp.ID, get_sprite_name(tp.publicationcode, get_sprite_range(tp.issuenumber, 20)), 20
    from tranches_pretes tp
    WHERE tp.issuenumber regexp '^[0-9]+$';
    INSERT INTO tranches_pretes_sprites(ID_Tranche, Sprite_name, Sprite_size)
    SELECT tp.ID, get_sprite_name(tp.publicationcode, get_sprite_range(tp.issuenumber, 50)), 50
    from tranches_pretes tp
    WHERE tp.issuenumber regexp '^[0-9]+$';
    INSERT INTO tranches_pretes_sprites(ID_Tranche, Sprite_name, Sprite_size)
    SELECT tp.ID, get_sprite_name(tp.publicationcode, get_sprite_range(tp.issuenumber, 100)), 100
    from tranches_pretes tp
    WHERE tp.issuenumber regexp '^[0-9]+$';
END;

create
    definer = root@localhost function get_sprite_name(publicationcode varchar(12), suffix varchar(30)) returns varchar(48)
    RETURN concat('edges-', REPLACE(publicationcode, '/', '-'), '-', suffix);

create
    definer = root@localhost function get_sprite_range(issuenumber varchar(10), rangewidth int(10)) returns varchar(30)
    RETURN concat(issuenumber - mod(issuenumber - 1, rangewidth), '-',
                  issuenumber - mod(issuenumber - 1, rangewidth) + rangewidth - 1);

create
    definer = root@`%` procedure reset_issue_popularities()
BEGIN

    UPDATE numeros issue
        INNER JOIN (
            SELECT DISTINCT n_inner.issuecode
            FROM numeros issue_inner,
                 numeros issue2_inner
            WHERE n_inner.NUMERO NOT REGEXP '^[0-9]+$'
              AND n2_inner.NUMERO NOT REGEXP '^[0-9]+$'
              AND LOWER(n_inner.issuecode) = LOWER(n2_inner.issuecode)
              AND n_inner.issuecode != n2_inner.issuecode
        ) n2
    SET n.issuecode = LOWER(n.issuecode)
    WHERE n.issuecode = n2.issuecode;


    TRUNCATE numeros_popularite;
    INSERT INTO numeros_popularite(issuecode, Popularite)
    SELECT DISTINCT n.issuecode,
                    COUNT(*) AS Popularite
    FROM numeros issue
    WHERE n.ID_Utilisateur NOT IN (
        SELECT u.ID
        FROM users u
        WHERE u.username LIKE 'test%'
    )
      AND n.DateAjout < DATE_SUB(NOW(), INTERVAL -1 MONTH)
    GROUP BY n.issuecode;


    UPDATE tranches_pretes tp
    SET points = (
        SELECT GREATEST(1, Popularite)
        FROM numeros_popularite np
        WHERE np.issuecode = tp.issuecode
    )
    WHERE points IS NULL;
END;

