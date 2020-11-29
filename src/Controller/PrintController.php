<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class PrintController extends AbstractController
{
    /**
     * @Route({
     *     "en": "/print/{currentType}",
     *     "fr": "/impression/{currentType}"
     * },
     *     methods={"GET"},
     *     requirements={"type"="^(?P<print_type_regex>classic|collectable|test)$"}
     * )
     */
    public function print(TranslatorInterface $translator, string $currentType): Response
    {
        return $this->render("bare.twig", [
            'commit' => $_ENV['COMMIT'],
            'bodyClass' => 'no-padding',
            'title' => $translator->trans('IMPRESSION_COLLECTION'),
            'username' => $this->getUser()->getUsername(),
            'vueProps' => ['component' => 'Print', 'current-type' => $currentType]
        ]);
    }
}