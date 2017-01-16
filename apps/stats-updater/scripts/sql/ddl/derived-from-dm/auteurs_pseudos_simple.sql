USE dm_stats;
CREATE TABLE dm_stats.auteurs_pseudos_simple
(
  ID_User INT(11) NOT NULL,
  NomAuteurAbrege VARCHAR(79) NOT NULL,
  Notation TINYINT(1),
  CONSTRAINT `PRIMARY` PRIMARY KEY (ID_User, NomAuteurAbrege)
);
CREATE INDEX index_auteur_inducks ON auteurs_pseudos_simple (NomAuteurAbrege);
