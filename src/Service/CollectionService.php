<?php
namespace App\Service;

class CollectionService
{
    private ApiService $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function retrieveUserPoints(array $userIds) : array {
        if (empty($userIds)) {
            return [];
        }

        return $this->apiService->runQuery(
            '
            select type_contribution.contribution, ids_users.ID_User, ifnull(contributions_utilisateur.points_total, 0) as points_total
            from (' . implode(' union ', array_map(function ($medalType) {
                return "select '$medalType' as contribution";
            }, ['Photographe', 'Createur', 'Duckhunter'])) . ') as type_contribution
            join (
                SELECT ID AS ID_User
                FROM users
                WHERE ID IN(' . implode(',', array_fill(0, count($userIds), '?')) . ')
            ) AS ids_users
            left join (
                SELECT uc.ID_User, uc.contribution, sum(points_new) as points_total
                FROM users_contributions uc
                GROUP BY uc.ID_User, uc.contribution
            ) as contributions_utilisateur
                ON type_contribution.contribution = contributions_utilisateur.contribution
               AND ids_users.ID_User = contributions_utilisateur.ID_user', 'dm', $userIds
        );
    }

}