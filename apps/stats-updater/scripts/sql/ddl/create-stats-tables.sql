CREATE TABLE dm_stats.auteurs_histoires
(
    personcode VARCHAR(22) NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (personcode, storycode)
);
CREATE INDEX index_person ON dm_stats.auteurs_histoires (personcode);
CREATE INDEX index_storycode ON dm_stats.auteurs_histoires (storycode);

CREATE TABLE dm_stats.histoires_publications
(
  storycode VARCHAR(19) NOT NULL,
  publicationcode VARCHAR(12) NOT NULL,
  issuenumber VARCHAR(12) NOT NULL,
  CONSTRAINT `PRIMARY` PRIMARY KEY (publicationcode, issuenumber, storycode)
);
CREATE INDEX index_issue ON dm_stats.histoires_publications (publicationcode, issuenumber);
CREATE INDEX index_story ON dm_stats.histoires_publications (storycode);

CREATE TABLE dm_stats.utilisateurs_histoires_manquantes
(
    ID_User INT(11) NOT NULL,
    personcode VARCHAR(22) NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (ID_User, personcode, storycode)
);

CREATE TABLE dm_stats.utilisateurs_publications_manquantes
(
    ID_User INT(11) NOT NULL,
    personcode VARCHAR(22) NOT NULL,
    storycode VARCHAR(19) NOT NULL,
    publicationcode VARCHAR(12) NOT NULL,
    issuenumber VARCHAR(12) NOT NULL,
    Notation TINYINT(3) unsigned NOT NULL,
    CONSTRAINT `PRIMARY` PRIMARY KEY (ID_User, storycode, publicationcode, issuenumber)
);
CREATE INDEX issue ON dm_stats.utilisateurs_publications_manquantes (ID_User, publicationcode, issuenumber);
CREATE INDEX user_stories ON dm_stats.utilisateurs_publications_manquantes (ID_User, personcode, storycode);

CREATE TABLE dm_stats.utilisateurs_publications_suggerees
(
  ID_User INT(11) NOT NULL,
  publicationcode VARCHAR(12) NOT NULL,
  issuenumber VARCHAR(12) NOT NULL,
  Score INT(11) NOT NULL,
  CONSTRAINT `PRIMARY` PRIMARY KEY (ID_User, publicationcode, issuenumber)
);
CREATE INDEX user ON dm_stats.utilisateurs_publications_suggerees (ID_User);