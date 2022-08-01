CREATE OR REPLACE TABLE auteurs_histoires
(
    ID int auto_increment primary key,
    personcode VARCHAR(79) charset latin1 collate latin1_swedish_ci NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    CONSTRAINT unique_index UNIQUE (personcode, storycode)
);
CREATE INDEX IF NOT EXISTS index_storycode ON auteurs_histoires (storycode);

CREATE OR REPLACE TABLE histoires_publications
(
    ID int auto_increment primary key,
    storycode VARCHAR(19) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    issuecode VARCHAR(25) NOT NULL,
    oldestdate DATE,
    CONSTRAINT unique_index UNIQUE (issuecode, storycode)
);
CREATE INDEX IF NOT EXISTS index_issue USING HASH ON histoires_publications (issuecode);
CREATE INDEX IF NOT EXISTS index_story USING HASH ON histoires_publications (storycode);
CREATE INDEX IF NOT EXISTS index_oldestdate ON histoires_publications (oldestdate);

CREATE OR REPLACE TABLE utilisateurs_histoires_manquantes
(
    ID int auto_increment primary key,
    ID_User INT(11) NOT NULL,
    personcode VARCHAR(79) charset latin1 collate latin1_swedish_ci NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    CONSTRAINT missing_issue_for_user UNIQUE (ID_User, personcode, storycode)
);

CREATE OR REPLACE TABLE utilisateurs_publications_manquantes
(
    ID int auto_increment primary key,
    ID_User INT(11) NOT NULL,
    personcode VARCHAR(79) charset latin1 collate latin1_swedish_ci NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    oldestdate DATE,
    Notation TINYINT(3) unsigned NOT NULL,
    CONSTRAINT unique_index UNIQUE (ID_User, personcode, storycode, publicationcode, issuenumber)
);
CREATE INDEX IF NOT EXISTS missing_user_issue ON utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber);
CREATE INDEX IF NOT EXISTS user_stories ON utilisateurs_publications_manquantes (ID_User, personcode, storycode);
CREATE INDEX IF NOT EXISTS suggested ON utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber, oldestdate);

CREATE OR REPLACE TABLE utilisateurs_publications_suggerees
(
    ID int auto_increment primary key,
    ID_User INT(11) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    oldestdate DATE,
    Score INT(11) NOT NULL,
    CONSTRAINT suggested_issue_for_user
        UNIQUE (ID_User, publicationcode, issuenumber)
);
CREATE INDEX IF NOT EXISTS suggested_issue_user ON utilisateurs_publications_suggerees (ID_User);
