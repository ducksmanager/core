<?php

namespace App\Controller;

use App\Service\ApiService;
use App\Service\CollectionService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/api/{role}/{path}",
     *     requirements={"role"="^[a-z]+$", "path"="^.+$"}
     * )
     */
    public function retrieve(ApiService $apiService, string $role, string $path): JsonResponse
    {
        return new JsonResponse($apiService->call("/$path", $role));
    }
}