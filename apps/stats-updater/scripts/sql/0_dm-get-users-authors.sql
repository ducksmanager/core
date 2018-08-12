SELECT ID_user, NomAuteurAbrege, Notation
FROM auteurs_pseudos
WHERE DateStat IS NULL AND NomAuteurAbrege <> ''
