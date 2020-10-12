<?php

namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/api/coa/{path}",
     *     requirements={"path"="^.+$"}
     * )
     */
    public function retrieveCoa(Request $request, ApiService $apiService, string $path): JsonResponse
    {
        return new JsonResponse($apiService->call("/coa/$path", 'coa', [], $request->getMethod()));
    }

    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/api/collection/{path}",
     *     requirements={"path"="^.+$"}
     * )
     */
    public function handleCollection(Request $request, ApiService $apiService, string $path): JsonResponse
    {
        return new JsonResponse($apiService->call("/collection/$path", 'ducksmanager', json_decode($request->getContent(), true), $request->getMethod(), false, [
            'dm-user' => $this->getUser()->getUsername(),
            'dm-pass' => $this->getUser()->getPassword(),
        ]));
    }
}