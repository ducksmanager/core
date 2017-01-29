LOAD DATA LOW_PRIORITY LOCAL INFILE 'export/numeros_simple.csv'
REPLACE
INTO TABLE dm_stats.numeros_simple
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' ESCAPED BY '\"' LINES TERMINATED BY '\n'
IGNORE 1 LINES
(ID_Utilisateur, Publicationcode, Numero);

-- Cleanup issues belonging to users who don't monitor authors
DELETE from dm_stats.numeros_simple
where ID_Utilisateur not in (select a_p.ID_User FROM dm_stats.auteurs_pseudos_simple a_p);

ALTER TABLE dm_stats.numeros_simple ADD CONSTRAINT numeros_simple_auteurs_pseudos_simple_ID_User_fk FOREIGN KEY (ID_Utilisateur) REFERENCES dm_stats.auteurs_pseudos_simple (ID_User);

SHOW WARNINGS;