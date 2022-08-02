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
