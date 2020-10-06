<?php
namespace App\Controller;

use App\Service\ApiService;
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
}