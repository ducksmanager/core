<?php

namespace App\Security;

use App\Service\ApiService;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\ClientException;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\UserNotFoundException;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\PassportInterface;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class UserAuthenticator extends AbstractAuthenticator
{
    use TargetPathTrait;

    public const LOGIN_ROUTE = 'app_login';

    private UrlGeneratorInterface $urlGenerator;
    private ApiService $apiService;
    private LoggerInterface $logger;

    public function __construct(UrlGeneratorInterface $urlGenerator, ApiService $apiService, LoggerInterface $logger)
    {
        $this->urlGenerator = $urlGenerator;
        $this->apiService = $apiService;
        $this->logger = $logger;
    }

    public function supports(Request $request): ?bool
    {
        return self::LOGIN_ROUTE === $request->attributes->get('_route')
            && $request->isMethod('POST');
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        if ($targetPath = $this->getTargetPath($request->getSession(), $firewallName)) {
            return new RedirectResponse($targetPath);
        }

        return new RedirectResponse($this->urlGenerator->generate('app_collection_show'));
    }

    public function authenticate(Request $request): PassportInterface
    {
        $credentials = [
            'username' => $request->request->get('username'),
            'password' => sha1($request->request->get('password')),
            'csrf_token' => $request->request->get('_csrf_token'),
        ];

        try {
            $roles = $this->apiService->call('/collection/privileges', 'ducksmanager', [], 'GET', false, [
                'dm-user' => $credentials['username'],
                'dm-pass' => $credentials['password']
            ]);
        }
        catch(ClientException $exception) {
            $this->logger->info($exception->getMessage());
            throw new AuthenticationException('Invalid credentials', Response::HTTP_UNAUTHORIZED);
        }

        if (is_array($roles)) {
            return new Passport(
                new UserBadge($request->request->get('username'), function(string $username) {
                    $apiUser = $this->apiService->call("/ducksmanager/user/$username", 'ducksmanager');
                    if ($apiUser) {
                        $permissions = $this->apiService->call("/collection/privileges", 'ducksmanager', [], 'GET', true, [
                            'dm-user' => $apiUser['username'],
                            'dm-pass' => $apiUser['password'],
                        ]);
                        $permissionList = array_merge(['ROLE_USER'], array_values(array_map(function(string $role) use ($permissions) {
                            return strtoupper("ROLE_${role}_{$permissions[$role]}");
                        }, array_keys($permissions))));
                        return new User($apiUser['id'], $apiUser['username'], $apiUser['password'], $permissionList);
                    }

                    throw new UserNotFoundException("Username not found : $username");
                }),
                new PasswordCredentials($credentials['password']),
                [new CsrfTokenBadge('authenticate', $credentials['csrf_token'])]
            );
        }
        throw new AuthenticationException('Invalid credentials', Response::HTTP_UNAUTHORIZED);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return null;
    }

}
