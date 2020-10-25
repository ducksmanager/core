<?php

namespace App\Controller;

use App\Security\User;
use App\Service\ApiService;
use App\Service\CollectionService;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class StatsController extends AbstractController
{
    /**
     * @return User|UserInterface|object|null
     */
    protected function getUser()
    {
        return parent::getUser();
    }

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

    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/stats/{type}"
     * )
     */
    public function showPublicationStats(UserService $userService, TranslatorInterface $translator, string $type): Response
    {
        return $this->render("bare.twig", [
            'title' => $translator->trans('STATISTIQUES_COLLECTION'),
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Stats',
                'tab' => $type
            ]
        ]);
    }
}