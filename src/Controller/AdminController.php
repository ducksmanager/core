<?php
namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class AdminController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/edges/progress"
     * )
     */
    public function showEdgeProgress(ApiService $apiService): JsonResponse
    {
        return new JsonResponse($apiService->call("/$path", $role));
    }
}