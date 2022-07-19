USE dm_stats_new;

insert ignore into utilisateurs_histoires_manquantes (ID_User, personcode, storycode)
select a_p.ID_User, a_h.personcode, a_h.storycode
from dm.auteurs_pseudos a_p
       inner join auteurs_histoires a_h on a_p.NomAuteurAbrege = a_h.personcode
       inner join histoires_publications h_pub
                  on a_h.storycode = h_pub.storycode
where not exists(select 1
                 from histoires_publications h_pub
                        inner join dm.numeros n on h_pub.issuecode = n.issuecode
                 where a_h.storycode = h_pub.storycode
                   and a_p.ID_User = n.ID_Utilisateur)
group by a_p.ID_User, a_h.personcode, a_h.storycode;

insert ignore into utilisateurs_publications_manquantes(ID_User, personcode, storycode, publicationcode, issuenumber,
                                                        oldestdate, Notation)
select distinct u_h_m.ID_User,
                u_h_m.personcode,
                u_h_m.storycode,
                h_p.publicationcode,
                h_p.issuenumber,
                h_p.oldestdate,
                a_p.Notation
from utilisateurs_histoires_manquantes u_h_m
       inner join histoires_publications h_p on u_h_m.storycode = h_p.storycode
       inner join dm.auteurs_pseudos a_p on u_h_m.ID_User = a_p.ID_User and u_h_m.personcode = a_p.NomAuteurAbrege
order by h_p.publicationcode, h_p.issuenumber;

insert ignore into utilisateurs_publications_suggerees(ID_User, publicationcode, issuenumber, oldestdate, Score)
select ID_User, publicationcode, issuenumber, oldestdate, sum(Notation)
from utilisateurs_publications_manquantes
group by ID_User, publicationcode, issuenumber, oldestdate
having sum(Notation) > 0;
