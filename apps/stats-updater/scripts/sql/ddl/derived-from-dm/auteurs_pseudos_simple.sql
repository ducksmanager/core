USE dm_stats_new;
CREATE TABLE dm_stats_new.auteurs_pseudos_simple
(
  ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  ID_User INT(11) NOT NULL,
  NomAuteurAbrege VARCHAR(79) NOT NULL,
  Notation TINYINT(1)
);
CREATE INDEX index_auteur_inducks ON auteurs_pseudos_simple (NomAuteurAbrege);
CREATE UNIQUE INDEX auteurs_pseudos_simple_ID_User_NomAuteurAbrege_uindex ON dm_stats_new.auteurs_pseudos_simple (ID_User, NomAuteurAbrege);