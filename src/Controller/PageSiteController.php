<?php

namespace App\Controller;

use App\Entity\Account;
use App\Security\User;
use App\Service\ApiService;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class PageSiteController extends AbstractController
{
    var UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * @return User|UserInterface|object|null
     */
    protected function getUser()
    {
        return parent::getUser();
    }


    protected function renderSitePage(string $title, string $page, array $vueProps = []): Response
    {
        return $this->render("bare.twig", [
            'title' => $title,
            'vueProps' => [
                    'title' => $title,
                    'component' => 'Site',
                    'page' => $page,
                    'username' => empty($this->getUser()) ? null : $this->getUser()->getUsername()
                ] + $vueProps
        ]);
    }

    /**
     * @Route({
     *     "en": "/bookcase/show/{username}",
     *     "fr": "/bibliotheque/show/{username}"
     * },
     *     defaults={"username"=null},
     *     methods={"GET"}
     * )
     */
    public function showBookcasePage(?string $username = null): Response
    {
        return $this->renderSitePage(
            '',
            'Bookcase', [
                'tab' => 'ViewBookcase',
                'bookcase-username' => $username ?? $this->getUser()->getUsername(),
            ]
        );
    }

    /**
     * @Route(
     *     methods={"GET", "POST"},
     *     path="/bookcase/options"
     * )
     */
    public function showBookcaseOptionsPage(): Response
    {
        return $this->renderSitePage(
            '',
            'Bookcase', [
                'tab' => 'BookcaseOptions'
            ]
        );
    }

    /**
     * @Route({
     *     "en": "/bookcase/contributors",
     *     "fr": "/bibliotheque/contributeurs"
     * },
     *     methods={"GET"}
     * )
     */
    public function showBookcaseContributorsPage(): Response
    {
        return $this->renderSitePage(
            '',
            'Bookcase', [
                'tab' => 'BookcaseContributors'
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
                return $this->redirectToRoute('app_collection_show');
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
    public function showStatsPage(string $type): Response
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
     *     "en": "/collection/show/{publicationCode}",
     *     "fr": "/collection/afficher/{publicationCode}"
     * },
     *     methods={"GET"},
     *     name="app_collection_show",
     *     requirements={"publicationCode"="^(?P<publicationcode_regex>[a-z]+/[-A-Z0-9]+)|new$"},
     *     defaults={"publicationCode"=null})
     * )
     */
    public function showCollection(ApiService $apiService, TranslatorInterface $translator, ?string $publicationCode): Response
    {
        $username = $this->getUser()->getUsername();
        if ($username === 'demo') {
            $apiService->call('/ducksmanager/resetDemo', 'admin', [], 'POST');
        }
        return $this->render("bare.twig", [
            'title' => $translator->trans('COLLECTION'),
            'username' => $username,
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Collection',
                'tab' => 'Manage',
                'publicationcode' => $publicationCode
            ]
        ]);
    }

    /**
     * @Route({
     *     "en": "/collection/account",
     *     "fr": "/collection/compte"
     * },
     *     methods={"GET", "POST"}
     * )
     */
    public function showAccountPage(Request $request, ValidatorInterface $validator, ApiService $apiService): Response
    {
        $success = null;
        $errors = [];
        if (!empty($request->getMethod() === 'POST')) {
            $account = Account::createFromRequest($request, $this->getUser());

            $errorResult = $validator->validate($account);
            if (!empty($errorResult->count())) {
                /** @var ConstraintViolation $error */
                foreach ($errorResult as $error) {
                    $errors[$error->getPropertyPath()] = $error->getMessage();
                }
            } else {
                $this->getUser()->setPassword($account->getUpToDatePassword());
                $apiResponse = $apiService->call('/ducksmanager/user/'.$this->getUser()->getUsername(), 'ducksmanager', $account->toArray(), 'POST');
                $success = !is_null($apiResponse);
            }
        }

        return $this->renderSitePage(
            '',
            'Collection',
            (is_null($success) ? [] : compact('success')) + ['tab' => 'account', 'errors' => json_encode($errors)]
        );
    }

    /**
     * @Route({
     *     "en": "/collection/subscriptions",
     *     "fr": "/collection/abonnements"
     * },
     *     methods={"GET", "POST"}
     * )
     */
    public function showSubscriptions(Request $request, ApiService $apiService): Response
    {
        $success = null;
        $errors = [];
        if (!empty($request->getMethod() === 'POST')) {
            $apiResponse = $apiService->call('/collection/subscriptions', 'ducksmanager', [
                'startDate' => $request->request->get('startDate'),
                'endDate' => $request->request->get('endDate'),
                'publicationCode' => $request->request->get('publicationCode'),
            ], 'PUT');
            $success = !is_null($apiResponse);
        }

        return $this->renderSitePage(
            '',
            'Collection',
            (is_null($success) ? [] : compact('success'))
            + ['tab' => 'subscriptions', 'errors' => json_encode($errors)]
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