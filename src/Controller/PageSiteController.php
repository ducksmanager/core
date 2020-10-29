<?php

namespace App\Controller;

use App\Security\User;
use App\Service\ApiService;
use App\Service\CollectionService;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class PageSiteController extends AbstractController
{
    var UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    protected function renderSitePage(string $title, string $page, array $vueProps = []): Response
    {
        return $this->render("bare.twig", [
            'title' => $title,
            'vueProps' => [
                'title' => $title,
                'component' => 'Site',
                'page' => $page,
                'username' => $this->getUser()->getUsername()
            ] + $vueProps
        ]);
    }

    /**
     * @Route({
     *     "en": "/bookcase/{username}",
     *     "fr": "/bibliotheque/{username}"
     * },
     *     defaults={"username"=null},
     *     methods={"GET"}
     * )
     */
    public function showBookcasePage(TranslatorInterface $translator, ?string $username = null): Response
    {
        return $this->renderSitePage(
            $translator->trans('BIBLIOTHEQUE_COURT'),
            'Bookcase', [
                'bookcase-username' => $username ?? $this->getUser()->getUsername(),
            ]
        );
    }

    /**
     * @Route({
     *     "en": "/expand",
     *     "fr": "/agrandir"
     * },
     *     methods={"GET"}
     * )
     */
    public function showExpandPage(TranslatorInterface $translator): Response
    {
        return $this->renderSitePage(
            $translator->trans('AGRANDIR_COLLECTION'),
            'Expand'
        );
    }

    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/inducks/import"
     * )
     */
    public function showImportPage(TranslatorInterface $translator): Response
    {
        return $this->renderSitePage(
            $translator->trans('IMPORTER_INDUCKS'),
            'InducksImport'
        );
    }

    /**
     * @Route({
     *     "en": "/print",
     *     "fr": "/impression"
     * },
     *     methods={"GET"}
     * )
     */
    public function showPrintPresentationPage(TranslatorInterface $translator): Response
    {
        return $this->renderSitePage(
            $translator->trans('IMPRESSION_COLLECTION'),
            'PrintPresentation'
        );
    }

    /**
     * @Route({
     *     "en": "/signup",
     *     "fr": "/inscription"
     * },
     *     methods={"GET", "POST"}
     * )
     */
    public function showSignupPage(TranslatorInterface $translator, ApiService $apiService, Request $request): Response
    {
        $success = null;
        $email = $request->request->get('email');
        if (!empty($email)) {
            $apiResponse = $apiService->call('/ducksmanager/user', 'ducksmanager', $request->getContent(), 'PUT');
            if (!is_null($apiResponse)) {
                return $this->redirectToRoute('app_collection_display');
            }
            $success = false;
        }
        return $this->renderSitePage(
            $translator->trans('INSCRIPTION'),
            'Signup',
            is_null($success) ? [] : compact('success')
        );
    }

    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/stats/{type}"
     * )
     */
    public function showStatsPage(TranslatorInterface $translator, string $type): Response
    {
        return $this->renderSitePage(
            '',
            'Stats', [
                'tab' => $type
            ]
        );
    }

    /**
     * @Route({
     *     "en": "/forgot",
     *     "fr": "/mot_de_passe_oublie"
     * },
     *     methods={"GET", "POST"}
     * )
     */
    public function showForgotPasswordPage(Request $request, TranslatorInterface $translator, ApiService $apiService): Response
    {
        $success = null;
        $email = $request->request->get('email');
        if (!empty($email)) {
            $apiResponse = $apiService->call('/ducksmanager/resetpassword/init', 'ducksmanager', compact('email'), 'POST');
            $success = !is_null($apiResponse);
        }

        return $this->renderSitePage(
            $translator->trans('MOT_DE_PASSE_OUBLIE'),
            'Forgot', is_null($success) ? [] : compact('success')
        );
    }

    /**
     * @Route({
     *     "en": "/bookstores",
     *     "fr": "/bouquineries"
     * },
     *     methods={"GET", "PUT"}
     * )
     */
    public function showBookstoreListPage(Request $request, ApiService $apiService, TranslatorInterface $translator): Response
    {
        $success = null;
        if ($request->getMethod() === 'PUT') {
            $data = (json_decode($request->getContent(), true) ?? []) + $request->query->all();
            $apiResponse = $apiService->call('/ducksmanager/bookstore/suggest', 'ducksmanager', $data, 'PUT');
            $success = !is_null($apiResponse);
        }
        return $this->renderSitePage(
            $translator->trans('LISTE_BOUQUINERIES'),
            'Bookstores',
            compact('success')
        );
    }
}