DROP DATABASE IF EXISTS dm_stats_old;
CREATE DATABASE dm_stats_old;

RENAME TABLE dm_stats.auteurs_histoires                     TO dm_stats_old.auteurs_histoires,                        dm_stats_new.auteurs_histoires                    TO dm_stats.auteurs_histoires;
RENAME TABLE dm_stats.auteurs_pseudos_simple                TO dm_stats_old.auteurs_pseudos_simple_old,               dm_stats_new.auteurs_pseudos_simple               TO dm_stats.auteurs_pseudos_simple;
RENAME TABLE dm_stats.histoires_publications                TO dm_stats_old.histoires_publications_old,               dm_stats_new.histoires_publications               TO dm_stats.histoires_publications;
RENAME TABLE dm_stats.numeros_simple                        TO dm_stats_old.numeros_simple_old,                       dm_stats_new.numeros_simple                       TO dm_stats.numeros_simple;
RENAME TABLE dm_stats.utilisateurs_histoires_manquantes     TO dm_stats_old.utilisateurs_histoires_manquantes_old,    dm_stats_new.utilisateurs_histoires_manquantes    TO dm_stats.utilisateurs_histoires_manquantes;
RENAME TABLE dm_stats.utilisateurs_publications_manquantes  TO dm_stats_old.utilisateurs_publications_manquantes_old, dm_stats_new.utilisateurs_publications_manquantes TO dm_stats.utilisateurs_publications_manquantes;
RENAME TABLE dm_stats.utilisateurs_publications_suggerees   TO dm_stats_old.utilisateurs_publications_suggerees_old,  dm_stats_new.utilisateurs_publications_suggerees  TO dm_stats.utilisateurs_publications_suggerees;