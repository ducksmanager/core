<?php

namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class BookstoreController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/bookstoreComment/list"
     * )
     */
    public function getActiveBookstoreComments(ApiService $apiService): JsonResponse
    {
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstoreComment/list/active', 'ducksmanager')
        );
    }
    /**
     * @Route(
     *     methods={"PUT"},
     *     path="/bookstoreComment/suggest"
     * )
     */
    public function suggestBookstoreComment(Request $request, ApiService $apiService): JsonResponse
    {
        $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstoreComment/suggest', 'ducksmanager', $data, 'POST')
        );
    }
}
