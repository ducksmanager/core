<?php

namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

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
     *     path="/admin/edges/wanted/data"
     * )
     */
    public function getEdgeProgressData(ApiService $apiService): Response
    {
        $mostWantedQuery = "
        SELECT Count(Numero) as numberOfIssues, CONCAT(Pays,'/',Magazine) AS publicationcode, Numero
        FROM numeros
        WHERE NOT EXISTS(
            SELECT 1
            FROM tranches_pretes
            WHERE CONCAT(numeros.Pays, '/', numeros.Magazine) = tranches_pretes.publicationcode
              AND numeros.Numero_nospace = tranches_pretes.issuenumber
        )
        GROUP BY Pays,Magazine,Numero
        ORDER BY numberOfIssues DESC, Pays, Magazine, Numero
        LIMIT 20";

        return new JsonResponse($apiService->runQuery($mostWantedQuery, 'dm', []));
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
     *     path="/admin/bookstore/list"
     * )
     */
    public function getBookstoresData(ApiService $apiService) {
        return new JsonResponse(
            $apiService->call('/ducksmanager/bookstore/list', 'ducksmanager')
        );
    }

    /**
     * @Route(
     *     methods={"POST"},
     *     path="/admin/bookstore/approve"
     * )
     */
    public function approveBookstore(Request $request, ApiService $apiService) {
        $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
        return new JsonResponse(
            $apiService->call(
                '/ducksmanager/bookstore/approve',
                'ducksmanager',
                $data,
                'POST'
            )
        );
    }
}
