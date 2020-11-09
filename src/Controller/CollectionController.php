<?php

namespace App\Controller;

use App\Security\User;
use App\Service\ApiService;
use App\Service\CollectionService;
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
     *     path="/collection/points"
     * )
     */
    public function retrievePoints(CollectionService $collectionService): JsonResponse
    {
        return new JsonResponse($collectionService->retrieveUserPoints(
            [$this->getUser()->getId()]
        ));
    }

    /**
     * @Route(
     *     methods={"DELETE"},
     *     path="/collection"
     * )
     */
    public function deleteCollection(ApiService $apiService): Response
    {
        $apiService->call("/ducksmanager/user/{$this->getUser()->getUsername()}", 'ducksmanager', [], 'DELETE');
        return new Response('OK', Response::HTTP_NO_CONTENT);
    }

    /**
     * @Route(
     *     methods={"POST"},
     *     path="/collection/empty"
     * )
     */
    public function emptyCollection(ApiService $apiService): Response
    {
        $apiService->call("/ducksmanager/user/{$this->getUser()->getUsername()}/empty", 'ducksmanager', [], 'POST');
        return new Response('OK', Response::HTTP_NO_CONTENT);
    }
}