<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PrintController extends AbstractController
{
    /**
     * @Route({
     *     "en": "/print/{type}",
     *     "fr": "/impression/{type}"
     * },
     *     methods={"GET"},
     *     requirements={"type"="^(?P<print_type_regex>classic|collectable|test)$"}
     * )
     */
    public function print(string $type): Response
    {
        return $this->render("print.twig", ['printStyle' => $type]);
    }
}