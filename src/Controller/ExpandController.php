<?php

namespace App\Controller;

use App\Security\User;
use App\Service\CollectionService;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExpandController extends AbstractController
{
    /**
     * @return User|UserInterface|object|null
     */
    protected function getUser()
    {
        return parent::getUser();
    }

    /**
     * @Route({
     *     "en": "/expand",
     *     "fr": "/agrandir"
     * },
     *     methods={"GET"}
     * )
     */
    public function display(TranslatorInterface $translator): Response
    {
        return $this->render("bare.twig", [
            'title' => $translator->trans('AGRANDIR_COLLECTION'),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Expand'
            ]
        ]);
    }
}