<?php

namespace App\Controller;

use App\Service\ApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

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
        return $this->render("bare.twig", ['vueProps' => [
            'component' => 'EdgeProgress'
        ]]);
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
        SELECT Count(Numero) as cpt, CONCAT(Pays,'/',Magazine) AS publicationcode, Numero
        FROM numeros
        WHERE NOT EXISTS(
            SELECT 1
            FROM tranches_pretes
            WHERE CONCAT(numeros.Pays, '/', numeros.Magazine) = tranches_pretes.publicationcode
              AND numeros.Numero_nospace = tranches_pretes.issuenumber
        )
        GROUP BY Pays,Magazine,Numero
        ORDER BY cpt DESC, Pays, Magazine, Numero
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
}