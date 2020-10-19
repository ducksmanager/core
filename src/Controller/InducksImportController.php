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

class InducksImportController extends AbstractController
{
    /**
     * @return User|UserInterface|object|null
     */
    protected function getUser()
    {
        return parent::getUser();
    }

    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/inducks/import"
     * )
     */
    public function import(UserService $userService, TranslatorInterface $translator): Response
    {
        return $this->render("bare.twig", [
            'title' => $translator->trans('IMPORTER_INDUCKS'),
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'InducksImport'
            ]
        ]);
    }
}