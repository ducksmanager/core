create table auteurs_histoires
(
    ID         int auto_increment
        primary key,
    personcode varchar(79) charset latin1 not null,
    storycode  varchar(19)                not null,
    constraint unique_index
        unique (personcode, storycode)
);

create index index_storycode
    on auteurs_histoires (storycode);

create table auteurs_pseudos
(
    ID_User         int         not null,
    NomAuteurAbrege varchar(79) not null,
    Notation        tinyint     null,
    primary key (ID_User, NomAuteurAbrege)
)
    charset = latin1;

create table histoires_publications
(
    ID              int auto_increment
        primary key,
    storycode       varchar(19) not null,
    publicationcode varchar(12) not null,
    issuenumber     varchar(12) not null,
    issuecode       varchar(25) not null,
    oldestdate      date        null,
    constraint unique_index
        unique (issuecode, storycode)
);

create index index_issue
    on histoires_publications (issuecode);

create index index_oldestdate
    on histoires_publications (oldestdate);

create index index_story
    on histoires_publications (storycode);

create table numeros_simple
(
    ID_Utilisateur  int         not null,
    Publicationcode varchar(12) not null,
    Numero          varchar(12) not null,
    primary key (ID_Utilisateur, Publicationcode, Numero),
    constraint numeros_simple_auteurs_pseudos_ID_User_fk
        foreign key (ID_Utilisateur) references auteurs_pseudos (ID_User)
)
    charset = latin1;

create index ID_Utilisateur
    on numeros_simple (ID_Utilisateur);

create index user_issue
    on numeros_simple (Publicationcode, Numero);

create table utilisateurs_histoires_manquantes
(
    ID         int auto_increment
        primary key,
    ID_User    int                        not null,
    personcode varchar(79) charset latin1 not null,
    storycode  varchar(19)                not null,
    constraint missing_issue_for_user
        unique (ID_User, personcode, storycode)
);

create table utilisateurs_publications_manquantes
(
    ID              int auto_increment
        primary key,
    ID_User         int                        not null,
    personcode      varchar(79) charset latin1 not null,
    storycode       varchar(19)                not null,
    publicationcode varchar(12)                not null,
    issuenumber     varchar(12)                not null,
    oldestdate      date                       null,
    Notation        tinyint unsigned           not null,
    constraint unique_index
        unique (ID_User, personcode, storycode, publicationcode, issuenumber)
);

create index missing_user_issue
    on utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber);

create index suggested
    on utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber, oldestdate);

create index user_stories
    on utilisateurs_publications_manquantes (ID_User, personcode, storycode);

create table utilisateurs_publications_suggerees
(
    ID              int auto_increment
        primary key,
    ID_User         int         not null,
    publicationcode varchar(12) not null,
    issuenumber     varchar(12) not null,
    oldestdate      date        null,
    Score           int         not null,
    constraint suggested_issue_for_user
        unique (ID_User, publicationcode, issuenumber)
);

create index suggested_issue_user
    on utilisateurs_publications_suggerees (ID_User);

