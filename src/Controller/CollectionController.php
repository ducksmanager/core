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

class CollectionController extends AbstractController
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
     *     "en": "/collection/show/{publicationCode}",
     *     "fr": "/collection/afficher/{publicationCode}"
     * },
     *     methods={"GET"},
     *     requirements={"publicationCode"="^(?P<publicationcode_regex>[a-z]+/[-A-Z0-9]+)|new$"},
     *     defaults={"publicationCode"=null})
     * )
     */
    public function display(UserService $userService, TranslatorInterface $translator, ?string $publicationCode): Response
    {
        return $this->render("bare.twig", [
            'title' => $translator->trans('COLLECTION'),
            'username' => $userService->getCurrentUsername(),
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Manage',
                'publicationcode' => $publicationCode
            ]
        ]);
    }

    /**
     * @Route(
     *     methods={"GET"},
     *     path="/collection/points"
     * )
     */
    public function retrievePoints(CollectionService $collectionService): JsonResponse
    {
        return new JsonResponse($collectionService->retrieveUserPoints([$this->getUser()->getId()]));
    }
}