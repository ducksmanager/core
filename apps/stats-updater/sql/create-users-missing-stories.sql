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
