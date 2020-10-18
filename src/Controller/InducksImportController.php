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
    public function import(UserService $userService): Response
    {
        return $this->render("collection.twig", [
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'InducksImport'
            ]
        ]);
    }
}