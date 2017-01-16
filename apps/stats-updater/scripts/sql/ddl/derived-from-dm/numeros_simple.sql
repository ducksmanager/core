USE dm_stats;
CREATE TABLE dm_stats.numeros_simple
(
  ID_Utilisateur INT(11) NOT NULL,
  Publicationcode VARCHAR(12) NOT NULL,
  Numero VARCHAR(12) NOT NULL,
  CONSTRAINT `PRIMARY` PRIMARY KEY (ID_Utilisateur, Publicationcode, Numero)
);
CREATE INDEX ID_Utilisateur ON numeros_simple (ID_Utilisateur);
CREATE INDEX Numero ON numeros_simple (Numero);
CREATE INDEX Publicationcode ON numeros_simple (Publicationcode);