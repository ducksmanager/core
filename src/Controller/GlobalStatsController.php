<?php
namespace App\Controller;

use App\Service\ApiService;
use App\Service\CollectionService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class GlobalStatsController {
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/stats/user/count"
     * )
     */
    public function getUserCount(ApiService $apiService) {
        return new JsonResponse([
            'count' => count(
                $apiService->call('/ducksmanager/users', 'ducksmanager')['users']
            )
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/stats/user/{userIds}"
     * )
     */
    public function getUsersStats(CollectionService $collectionService, string $userIds) {
        $userIds = array_values(array_filter(explode(',', $userIds), function(string $userIds) {
            return (int) $userIds;
        }));
        return new JsonResponse([
            'points' => $collectionService->retrieveUserPoints($userIds),
            'stats' => $collectionService->retrieveUserQuickStats($userIds)
        ]);
    }
}