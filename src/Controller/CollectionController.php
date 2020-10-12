<?php

namespace App\Controller;

use App\Security\User;
use App\Service\CollectionService;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;

class CollectionController extends AbstractController
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
     *     path="/collection"
     * )
     */
    public function retrieve(CollectionService $collectionService): JsonResponse
    {
        return new JsonResponse($collectionService->retrieveUserCollection());
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/collection/show/{publicationCode}",
     *     requirements={"publicationCode"="^(?P<publicationcode_regex>[a-z]+/[-A-Z0-9]+)$"}
     * )
     */
    public function display(UserService $userService, string $publicationCode): Response
    {
        return $this->render("collection.twig", [
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'IssueList',
                'publicationcode' => $publicationCode
            ]
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/collection/points"
     * )
     */
    public function retrievePoints(CollectionService $collectionService): JsonResponse
    {
        return new JsonResponse($collectionService->retrieveUserPoints([$this->getUser()->getId()]));
    }
}