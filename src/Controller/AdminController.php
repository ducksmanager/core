<?php

namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\ResponseInterface;

class AdminController extends AbstractController
{
    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/edges/progress"
     * )
     */
    public function showEdgeProgress(): Response
    {
        return $this->render("bare.twig", [
            'commit' => $_ENV['COMMIT'],
            'vueProps' => [
                'component' => 'EdgeProgress'
            ]
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/bookstores"
     * )
     */
    public function showBookstoresAdmin(): Response
    {
        return $this->render("bare.twig", [
            'commit' => $_ENV['COMMIT'],
            'vueProps' => [
                'component' => 'BookstoresAdmin'
            ]
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/presentationSentence/{choice}"
     * )
     */
    public function validatePresentationSentence(string $choice, Request $request, ApiService $apiService): Response
    {
        $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
        return new JsonResponse(
            $apiService->call(
                "/ducksmanager/presentationSentence/$choice",
                'ducksmanager',
                $data,
                'POST'
            )
        );
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/edges/wanted/data"
     * )
     */
    public function getEdgeProgressData(ApiService $apiService): Response
    {
        return new JsonResponse(
            $apiService->call('/edges/wanted', 'ducksmanager')
        );
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/edges/published/data"
     * )
     */
    public function getPublishedEdgesData(ApiService $apiService): Response
    {
        $publishedEdgesQuery = "SELECT publicationcode, issuenumber FROM tranches_pretes";
        return new JsonResponse($apiService->runQuery($publishedEdgesQuery, 'dm', []));
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/admin/bookstoreComment/list"
     * )
     */
    public function getBookstoresData(ApiService $apiService) {
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstoreComment/list', 'ducksmanager')
        );
    }

    /**
     * @Route(
     *     methods={"POST"},
     *     path="/admin/bookstoreComment/approve"
     * )
     */
    public function approveBookstore(Request $request, ApiService $apiService) {
        $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
        return new JsonResponse(
            $apiService->call(
                '/ducksmanager/bookstoreComment/approve',
                'ducksmanager',
                $data,
                'POST'
            )
        );
    }
}
