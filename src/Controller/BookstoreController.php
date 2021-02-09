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
     *     path="/bookstore/list"
     * )
     */
    public function getActiveBookstores(ApiService $apiService) {
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstore/list/active', 'ducksmanager')
        );
    }
    /**
     * @Route(
     *     methods={"PUT"},
     *     path="/bookstore/suggest"
     * )
     */
    public function suggestBookstore(Request $request, ApiService $apiService) {
        $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstore/suggest', 'ducksmanager', $data, 'POST')
        );
    }
}
