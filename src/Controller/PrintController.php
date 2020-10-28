<?php

namespace App\Controller;

use App\Service\UserService;
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
    public function print(UserService $userService, TranslatorInterface $translator, string $currentType): Response
    {
        return $this->render("bare.twig", [
            'bodyClass' => 'no-padding',
            'title' => $translator->trans('IMPRESSION_COLLECTION'),
            'username' => $userService->getCurrentUsername(),
            'vueProps' => ['component' => 'Print', 'current-type' => $currentType]
        ]);
    }
}