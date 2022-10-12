<?php

namespace App\Controller;

use App\Security\User;
use App\Security\UserAuthenticator;
use LogicException;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Http\Authentication\UserAuthenticatorInterface;

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
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        if (!empty($this->getUser())) {
            return $this->redirectToRoute('app_collection_show');
        }

        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();
        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.twig', [
            'commit' => $_ENV['COMMIT'],
            'vueProps' => [
                'component' => 'Site',
                'page' => 'Login',
                'last-username' => $lastUsername,
                'error' => is_null($error) ? null : 'Les identifiants que vous avez entré sont invalides, veuillez réessayer.'
            ]
        ]);
    }

    /**
     * @Route({
     *     "en": "/logout",
     *     "fr": "/deconnexion"
     * },
     * name="app_logout")
     */
    public function logout()
    {
        throw new LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }
}
