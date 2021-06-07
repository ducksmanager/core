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
    public function getUserCount(ApiService $apiService): JsonResponse
    {
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
    public function getUsersStats(ApiService $apiService, string $userIds): JsonResponse
    {
        return new JsonResponse(
            $apiService->call("/global-stats/user/$userIds", 'ducksmanager')
        );
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/global-stats/user/collection/rarity"
     * )
     */
    public function getUserRarityStats(ApiService $apiService): JsonResponse
    {
        $userId = $this->getUser()->getId();
        $rarityScores = $apiService->call('/ducksmanager/users/collection/rarity', 'ducksmanager');
        $userScores = array_map(
            fn(array $userScoreData) => $userScoreData['averageRarity'],
            $rarityScores
        );
        $myScore = array_values(array_filter(
            $rarityScores,
            fn(array $userScoreData) => $userScoreData['userId'] === $userId));
        return new JsonResponse([
            'userScores' => $userScores,
            'myScore' => $myScore ? $myScore[0]['averageRarity'] : 0
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/global-stats/bookcase/contributors"
     * )
     */
    public function getBookcaseContributors(BookcaseService $bookcaseService): JsonResponse
    {
        return new JsonResponse($bookcaseService->retrieveBookcaseContributors());
    }
}
