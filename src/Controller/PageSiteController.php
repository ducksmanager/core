<?php

namespace App\Controller;

use App\Entity\Account;
use App\Entity\PasswordChange;
use App\Security\User;
use App\Service\ApiService;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class PageSiteController extends AbstractController
{
    var RouterInterface $router;
    var LoggerInterface $logger;

    public function __construct(RouterInterface $router, LoggerInterface $logger)
    {
        $this->router = $router;
        $this->logger = $logger;
    }

    /**
     * @return User|UserInterface|object|null
     */
    protected function getUser()
    {
        return parent::getUser();
    }

    /**
     * @Route({
     *     "en": "/bookcase/show/{username}",
     *     "fr": "/bibliotheque/afficher/{username}"
     * },
     *     defaults={"username"=null},
     *     methods={"GET"}
     * )
     */
    public function showBookcasePage(?string $username = null): Response
    {
        if (is_null($username) && is_null($this->getUser())) {
            return $this->redirectToRoute('app_login');
        }
        return $this->renderSitePage(
            'Bookcase',
            $username ? 'Bibliothèque DucksManager de'.' '.$username : 'Ma bibliothèque',
            null,
            [
                'tab' => 'ViewBookcase',
                'bookcase-username' => $username ?? $this->getUser()->getUsername(),
            ]
        );
    }

    /**
     * @Route({
     *     "en": "/forgot/{token}",
     *     "fr": "/mot_de_passe_oublie/{token}"
     * },
     *     methods={"GET", "POST"},
     *     defaults={"token"=null}
     * )
     */
    public function showForgotPasswordPage(Request $request, ValidatorInterface $validator, ApiService $apiService, ?string $token): Response
    {
        $errors = [];
        $success = null;
        if (!empty($token)) {
            if ($request->getMethod() === 'POST') {
                $account = PasswordChange::createFromRequest($request, $token);

                $errorResult = $validator->validate($account);
                if (!empty($errorResult->count())) {
                    /** @var ConstraintViolation $error */
                    foreach ($errorResult as $error) {
                        $errors[$error->getPropertyPath()] = $error->getMessage();
                    }
                } else {
                    $apiResponse = $apiService->callNoParse('/ducksmanager/resetpassword', 'ducksmanager', $account->toArray(), 'POST');
                    $success = $apiResponse->getStatusCode() === 200;
                }
            }
            else {
                $apiResponse = $apiService->callNoParse("/ducksmanager/resetpassword/checktoken/$token", 'ducksmanager', [], 'POST');
                if ($apiResponse->getStatusCode() !== 200) {
                    $success = false;
                }
            }
        }
        else if (!empty($email = $request->request->get('email'))) {
            $apiResponse = $apiService->call('/ducksmanager/resetpassword/init', 'ducksmanager', compact('email'), 'POST');
            $success = !is_null($apiResponse);
        }

        return $this->renderSitePage(
            'Forgot',
            'Mot de passe oublié ?',
            'Mot de passe oublié ?',
            (is_null($success) ? [] : compact('success')) + compact('token') + ['errors' => json_encode($errors)]
        );
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
        $hasRequestedPresentationSentence = false;
        $errors = [];
        if ($request->getMethod() === 'POST') {
            $dbUser = $apiService->call("/ducksmanager/user/{$this->getUser()->getUsername()}", 'ducksmanager');
            $account = Account::createFromRequest($request, $dbUser);

            $errorResult = $validator->validate($account);
            if (!empty($errorResult->count())) {
                /** @var ConstraintViolation $error */
                foreach ($errorResult as $error) {
                    $errors[$error->getPropertyPath()] = $error->getMessage();
                }
            } else {
                /** @var User $user */
                $user = $this->getUser();

                $accountData = $account->toArray();
                $apiResponse = $apiService->call(
                    "/ducksmanager/user/{$user->getUsername()}",
                    'ducksmanager',
                    $accountData,
                    'POST'
                );
                $user->setPassword($accountData['password']);

                $success = !is_null($apiResponse);
                $hasRequestedPresentationSentence = $account->hasRequestedPresentationSentence();
            }
        }

        return $this->renderSitePage(
            'Collection',
            'Mon compte',
            null,
            (is_null($success) ? [] : compact('success', 'hasRequestedPresentationSentence'))
            + ['tab' => 'account', 'errors' => json_encode($errors)]
        );
    }
}
