<?php

namespace App\Controller;

use App\Service\UserService;
use LogicException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends PageSiteController
{
    /**
     * @Route({
     *     "en": "/login",
     *     "fr": "/connexion"
     * },
     *     name="app_login"
     * )
     */
    public function login(AuthenticationUtils $authenticationUtils, UserService $userService): Response
    {
        if (!empty($userService->getCurrentUserId())) {
            return $this->redirectToRoute('app_collection_display');
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.twig', [
            'vueProps' => [
                    'component' => 'Site',
                    'page' => 'Login',
                    'last-username' => $lastUsername,
                ] + compact('error')
        ]);
    }

    /**
     * @Route("/logout", name="app_logout")
     */
    public function logout()
    {
        throw new LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
