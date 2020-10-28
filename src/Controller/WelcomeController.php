<?php

namespace App\Controller;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class WelcomeController extends AbstractController
{
    /**
     * @Route("/",
     *     methods={"GET"}
     * )
     */
    public function showWelcome(TranslatorInterface $translator, UserService $userService): Response
    {
        return $this->render("bare.twig", [
            'title' => $translator->trans('BIENVENUE'),
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Welcome'
            ]
        ]);
    }
}