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

class BookcaseController extends AbstractController
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
     *     "en": "/bookcase",
     *     "fr": "/bibliotheque"
     * },
     *     methods={"GET"}
     * )
     */
    public function display(UserService $userService, TranslatorInterface $translator, ?string $publicationCode): Response
    {
        return $this->render("bare.twig", [
            'title' => $translator->trans('BIBLIOTHEQUE_COURT'),
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Bookcase'
            ]
        ]);
    }
}