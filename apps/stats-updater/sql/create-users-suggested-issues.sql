insert ignore into utilisateurs_publications_suggerees(ID_User, publicationcode, issuenumber, oldestdate, Score)
select ID_User, publicationcode, issuenumber, oldestdate, sum(Notation)
from utilisateurs_publications_manquantes
group by ID_User, publicationcode, issuenumber, oldestdate
having sum(Notation) > 0;
