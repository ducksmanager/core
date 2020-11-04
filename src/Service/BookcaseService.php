<?php

namespace App\Service;

class BookcaseService
{
    private ApiService $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function retrieveBookcaseContributors(): array
    {
        $results = $this->apiService->runQuery("
            SELECT distinct users.ID AS userId, users.username AS name, '' AS text from users
            inner join users_contributions c on users.ID = c.ID_user
            where c.contribution IN ('photographe', 'createur')
            UNION
            SELECT '' as userId, Nom AS name, Texte AS text
            FROM bibliotheque_contributeurs
        ", 'dm');

        return array_map(function(array $result) {
            $result['userId'] = intval($result['userId']);
            return $result;
        }, $results);
    }
}