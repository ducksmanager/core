<?php

namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpClient\Exception\ClientException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ApiController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/api/coa/{path}",
     *     requirements={"path"="^.+$"}
     * )
     */
    public function retrieveCoa(Request $request, ApiService $apiService, string $path): JsonResponse
    {
        return new JsonResponse($apiService->call("/coa/$path", 'coa', json_decode($request->getContent(), true), $request->getMethod()));
    }

    /**
     * @Route(
     *     methods={"GET", "POST", "PUT", "DELETE"},
     *     path="/api/{prefix}/{path}",
     *     requirements={"prefix"="^(collection|bookcase)$", "path"="^.+$"}
     * )
     */
    public function handleCollection(Request $request, ApiService $apiService, string $prefix, string $path): Response
    {
        $userCredentials = is_null($this->getUser()) ? [] : [
            'dm-user' => $this->getUser()->getUsername(),
            'dm-pass' => $this->getUser()->getPassword(),
        ];
        try {
            $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
            return new JsonResponse($apiService->call("/$prefix/$path", 'ducksmanager', $data, $request->getMethod(), false, $userCredentials));
        }
        catch(ClientException $clientException) {
            return new Response('', $clientException->getCode());
        }
    }
}