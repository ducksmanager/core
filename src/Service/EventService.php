<?php

namespace App\Service;


class EventService
{
    private ApiService $apiService;

    const MEDAL_LEVELS = [
        'Photographe' => [1 => 50, 2 => 150, 3 => 600],
        'Createur' => [1 => 20, 2 => 70, 3 => 150],
        'Duckhunter' => [1 => 1, 2 => 3, 3 => 5]
    ];

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function retrieveSignups(): array
    {
        return $this->apiService->runQuery('
            SELECT \'signup\' as type, users.ID as ID_Utilisateur, UNIX_TIMESTAMP(DateInscription) AS timestamp
            FROM users
            WHERE EXISTS(
                SELECT 1 FROM numeros WHERE users.ID = numeros.ID_Utilisateur
            )
              AND DateInscription > date_add(now(), interval -1 month) AND users.username NOT LIKE \'test%\'
        ', 'dm');
    }

    public function retrieveCollectionUpdates(): array
    {
        return $this->apiService->runQuery('
            SELECT \'collection_update\' as type, users.ID AS ID_Utilisateur,
                UNIX_TIMESTAMP(DateAjout) AS timestamp, COUNT(Numero) AS cpt,
                (SELECT CONCAT(Pays,\'/\',Magazine,\'/\',Numero)
                FROM numeros n
                WHERE n.ID=numeros.ID
                LIMIT 1) AS Numero_Exemple
            FROM numeros
            INNER JOIN users ON numeros.ID_Utilisateur=users.ID
            WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH) AND users.username<>\'demo\' AND users.username NOT LIKE \'test%\'
            GROUP BY users.ID, DATE(DateAjout)
            HAVING COUNT(Numero) > 0
            ORDER BY DateAjout DESC
        ', 'dm');
    }

    public function retrieveBookstoreCreations(): array
    {
        return $this->apiService->runQuery('
            SELECT \'bookstore_creation\' as type, uc.ID_user AS ID_Utilisateur, bouquineries.Nom AS Nom, UNIX_TIMESTAMP(DateAjout) AS timestamp
            FROM bouquineries
            INNER JOIN users_contributions uc ON bouquineries.ID = uc.ID_bookstore
            WHERE Actif=1 AND DateAjout > date_add(now(), interval -1 month)
        ', 'dm');
    }

    public function retrieveEdgeCreations(): array
    {
        return $this->apiService->runQuery("
            SELECT 'edge' as type, tp.publicationcode, tp.issuenumber, GROUP_CONCAT(DISTINCT tpc.ID_user ORDER BY tpc.ID_user) AS collaborateurs, DATE(tp.dateajout) DateAjout,
                UNIX_TIMESTAMP(tp.dateajout) AS timestamp,
                CONCAT(tp.publicationcode,'/',tp.issuenumber) AS Numero
            FROM tranches_pretes tp
            INNER JOIN users_contributions tpc ON tpc.ID_tranche = tp.ID
            WHERE tp.dateajout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
              AND NOT (tp.publicationcode = 'fr/JM' AND tp.issuenumber REGEXP '^[0-9]+$')
            GROUP BY tp.dateajout, tp.publicationcode, tp.issuenumber
            ORDER BY tp.dateajout DESC, collaborateurs
        ", 'dm');
    }

    public function retrieveNewMedals(): array
    {
        return $this->apiService->runQuery(
            implode(' UNION ', array_map(function ($type_medaille) {
                return implode(' UNION ', array_map(function ($niveau) use ($type_medaille) {
                    $limite = self::MEDAL_LEVELS[$type_medaille][$niveau];
                    $type_medaille = strtolower($type_medaille);
                    return "
                        select 'medal' as type, ID_User, contribution, $niveau as niveau, UNIX_TIMESTAMP(date) - 60 AS timestamp
                        from users_contributions
                        where contribution = '$type_medaille'
                          and points_total >= $limite and points_total - points_new < $limite
                          and date > DATE_ADD(NOW(), INTERVAL -1 MONTH)
                    ";
                }, array_keys(self::MEDAL_LEVELS[$type_medaille])));
            }, array_keys(self::MEDAL_LEVELS))),
            "dm");
    }

}