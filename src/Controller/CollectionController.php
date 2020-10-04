<?php

namespace App\Controller;

use App\Security\User;
use App\Service\CollectionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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
     *     path="/collection/points"
     * )
     */
    public function retrievePoints(CollectionService $collectionService): JsonResponse
    {
        return new JsonResponse($collectionService->retrieveUserPoints([$this->getUser()->getId()]));
    }
}