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
            SELECT \'signup\' as type, users.ID as userId, UNIX_TIMESTAMP(DateInscription) AS timestamp
            FROM users
            WHERE EXISTS(
                SELECT 1 FROM numeros WHERE users.ID = numeros.ID_Utilisateur
            )
              AND DateInscription > date_add(now(), interval -1 month) AND users.username NOT LIKE \'test%\'
        ', 'dm');
    }

    public function retrieveCollectionUpdates(): array
    {
        return $this->apiService->runQuery("
            SELECT 'collection_update' as type, users.ID AS userId,
                UNIX_TIMESTAMP(DateAjout) AS timestamp, COUNT(Numero) AS numberOfIssues,
                (SELECT CONCAT(Pays,'/',Magazine,'/',Numero)
                FROM numeros n
                WHERE n.ID=numeros.ID
                LIMIT 1) AS exampleIssue
            FROM numeros
            INNER JOIN users ON numeros.ID_Utilisateur=users.ID
            WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
              AND users.username<>'demo' AND users.username NOT LIKE 'test%'
              AND numeros.Abonnement = 0
            GROUP BY users.ID, DATE(DateAjout)
            HAVING COUNT(Numero) > 0
        ", 'dm');
    }

    public function retrieveCollectionSubscriptionAdditions(): array
    {
        return $this->apiService->runQuery("
            SELECT 'subscription_additions' as type,
                CONCAT(numeros.Pays, '/', numeros.Magazine) AS publicationCode,
                numeros.Numero AS issueNumber,
                GROUP_CONCAT(numeros.ID_Utilisateur) AS users,
                UNIX_TIMESTAMP(DateAjout) AS timestamp
            FROM numeros
            WHERE DateAjout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
              AND numeros.Abonnement = 1
            GROUP BY DATE(DateAjout), numeros.Pays, numeros.Magazine, numeros.Numero
        ", 'dm');
    }

    public function retrieveBookstoreCreations(): array
    {
        return $this->apiService->runQuery('
            SELECT \'bookstore_creation\' as type, uc.ID_user AS userId, bouquineries.Nom AS name, UNIX_TIMESTAMP(DateAjout) AS timestamp
            FROM bouquineries
            INNER JOIN users_contributions uc ON bouquineries.ID = uc.ID_bookstore
            WHERE Actif=1 AND DateAjout > date_add(now(), interval -1 month)
        ', 'dm');
    }

    public function retrieveEdgeCreations(): array
    {
        return $this->apiService->runQuery(<<<SQL
        select 'edge' as type,
            CONCAT('[', GROUP_CONCAT(json_object(
                'publicationCode',
                publicationcode,
                'issueNumber',
                issuenumber
            )), ']') AS edges,
            UNIX_TIMESTAMP(creationDate) AS timestamp,
            users
        from (
            SELECT tp.publicationcode,
                tp.issuenumber,
                tp.dateajout                       AS creationDate,
                GROUP_CONCAT(DISTINCT tpc.ID_user) AS users
            FROM tranches_pretes tp
               INNER JOIN users_contributions tpc ON tpc.ID_tranche = tp.ID
            WHERE tp.dateajout > DATE_ADD(NOW(), INTERVAL -1 MONTH)
              AND NOT (tp.publicationcode = 'fr/JM' AND tp.issuenumber REGEXP '^[0-9]+$')
              AND NOT (tp.publicationcode = 'it/TL')
            GROUP BY tp.ID) as edges_and_collaborators
        group by DATE_FORMAT(creationDate, '%Y-%m-%d %H:00:00'), edges_and_collaborators.users
        SQL, 'dm');
    }

    public function retrieveNewMedals(): array
    {
        return $this->apiService->runQuery(
            implode(' UNION ', array_map(function (string $medalType) {
                return implode(' UNION ', array_map(function ($niveau) use ($medalType) {
                    $limite = self::MEDAL_LEVELS[$medalType][$niveau];
                    $medalType = strtolower($medalType);
                    return "
                        select 'medal' as type, ID_User AS userId, contribution, $niveau as niveau, UNIX_TIMESTAMP(date) - 60 AS timestamp
                        from users_contributions
                        where contribution = '$medalType'
                          and points_total >= $limite and points_total - points_new < $limite
                          and date > DATE_ADD(NOW(), INTERVAL -1 MONTH)
                    ";
                }, array_keys(self::MEDAL_LEVELS[$medalType])));
            }, array_keys(self::MEDAL_LEVELS))),
            "dm");
    }

}
