LOAD DATA LOW_PRIORITY LOCAL INFILE 'csv_results_dir/dm-users-issues.csv'
IGNORE
INTO TABLE numeros_simple
CHARACTER SET utf8mb4
FIELDS TERMINATED BY '\t' OPTIONALLY ENCLOSED BY '\"' ESCAPED BY '\"' LINES TERMINATED BY '\n'
(ID_Utilisateur, Publicationcode, Numero);

-- Cleanup issues belonging to users who don't monitor authors
DELETE from numeros_simple
where ID_Utilisateur not in (select a_p.ID_User FROM auteurs_pseudos a_p);

ALTER TABLE numeros_simple ADD CONSTRAINT numeros_simple_auteurs_pseudos_ID_User_fk FOREIGN KEY (ID_Utilisateur) REFERENCES auteurs_pseudos (ID_User);

SHOW WARNINGS;
