<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PrivacyController extends AbstractController
{
    /**
     * @Route({
     *     "en": "/privacy",
     *     "fr": "/privacy"
     * },
     *     methods={"GET"}
     * )
     */
    public function privacy(): Response
    {
        return $this->render("bare.twig", [
            'commit' => $_ENV['COMMIT'],
            'title' => 'Privacy',
            'vueProps' => ['component' => 'Privacy']
        ]);
    }
}
