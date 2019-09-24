CREATE TABLE auteurs_histoires
(
    ID int auto_increment primary key,
    personcode VARCHAR(22) NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    CONSTRAINT unique_index UNIQUE (personcode, storycode)
);
CREATE INDEX index_storycode ON auteurs_histoires (storycode);

CREATE TABLE histoires_publications
(
    ID int auto_increment primary key,
    storycode VARCHAR(19) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    oldestdate DATE,
    CONSTRAINT unique_index UNIQUE (publicationcode, issuenumber, storycode)
);
CREATE INDEX index_issue USING HASH ON histoires_publications (publicationcode, issuenumber);
CREATE INDEX index_story USING HASH ON histoires_publications (storycode);
CREATE INDEX index_oldestdate ON histoires_publications (oldestdate);

CREATE TABLE utilisateurs_histoires_manquantes
(
    ID int auto_increment primary key,
    ID_User INT(11) NOT NULL,
    personcode VARCHAR(22) NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    CONSTRAINT missing_issue_for_user UNIQUE (ID_User, personcode, storycode)
);

CREATE TABLE utilisateurs_publications_manquantes
(
    ID int auto_increment primary key,
    ID_User INT(11) NOT NULL,
    personcode VARCHAR(22) NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    oldestdate DATE,
    Notation TINYINT(3) unsigned NOT NULL,
    CONSTRAINT unique_index UNIQUE (ID_User, personcode, storycode, publicationcode, issuenumber)
);
CREATE INDEX missing_user_issue ON utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber);
CREATE INDEX user_stories ON utilisateurs_publications_manquantes (ID_User, personcode, storycode);
CREATE INDEX suggested ON utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber, oldestdate);

CREATE TABLE utilisateurs_publications_suggerees
(
    ID int auto_increment primary key,
    ID_User INT(11) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    oldestdate DATE,
    Score INT(11) NOT NULL,
    CONSTRAINT suggested_issue_for_user
        UNIQUE (ID_User, publicationcode, issuenumber),
    CONSTRAINT utilisateurs_publications_suggerees_pseudos_fk
        FOREIGN KEY (ID_User) REFERENCES auteurs_pseudos (ID_User)
);
CREATE INDEX suggested_issue_user ON utilisateurs_publications_suggerees (ID_User);
