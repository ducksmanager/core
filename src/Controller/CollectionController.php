<?php

namespace App\Controller;

use App\Service\ApiService;
use App\Service\CollectionService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CollectionController extends AbstractController
{
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
}