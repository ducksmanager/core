<?php

namespace App\Controller;

use App\Security\User;
use App\Service\ApiService;
use App\Service\CollectionService;
use App\Service\UserService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class BookstoreController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/bookstore/list"
     * )
     */
    public function getBookstores(ApiService $apiService) {
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstore/list', 'ducksmanager')
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
            $apiService->call('/ducksmanager/bookstore/suggest', 'ducksmanager', $data, 'PUT')
        );
    }
}