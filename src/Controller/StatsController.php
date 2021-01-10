<?php

namespace App\Controller;

use App\Service\ApiService;
use App\Service\BookcaseService;
use App\Service\CollectionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class StatsController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/global-stats/user/count"
     * )
     */
    public function getUserCount(ApiService $apiService) {
        return new JsonResponse([
            'count' => $apiService->call('/ducksmanager/users/count', 'ducksmanager')['count']
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/global-stats/user/{userIds}"
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

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/global-stats/bookcase/contributors"
     * )
     */
    public function getBookcaseContributors(BookcaseService $bookcaseService) {
        return new JsonResponse($bookcaseService->retrieveBookcaseContributors());
    }
}
