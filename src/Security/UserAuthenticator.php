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
use Symfony\Component\Security\Http\Authenticator\AbstractLoginFormAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\PassportInterface;
use Symfony\Component\Security\Http\Util\TargetPathTrait;

class UserAuthenticator extends AbstractLoginFormAuthenticator
{
    use TargetPathTrait;

    public const LOGIN_ROUTE = 'POST app_login';
    public const SIGNUP_ROUTE = 'POST app_signup';

    private UrlGeneratorInterface $urlGenerator;
    private ApiService $apiService;
    private LoggerInterface $logger;

    public function __construct(UrlGeneratorInterface $urlGenerator, ApiService $apiService, LoggerInterface $logger)
    {
        $this->urlGenerator = $urlGenerator;
        $this->apiService = $apiService;
        $this->logger = $logger;
    }

    private function getUrl(Request $request): string {
        return $request->getMethod().' ' .$request->attributes->get('_route');
    }

    public function supports(Request $request): bool
    {
        return in_array(
            $this->getUrl($request),
            [self::LOGIN_ROUTE, self::SIGNUP_ROUTE],
            true
        );
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
        if ($request->getMethod().' ' .$request->attributes->get('_route') === self::SIGNUP_ROUTE) {
            $data = $request->request->all();
            try {
                $this->apiService->call('/ducksmanager/user', 'ducksmanager', $data, 'PUT');
            }
            catch(ClientException $e) {
                throw new AuthenticationException($e->getMessage(), $e->getCode());
            }
        }

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
                        $permissionList = array_merge(['ROLE_USER'], array_values(array_map(fn(string $role) =>
                            strtoupper("ROLE_${role}_{$permissions[$role]}"), array_keys($permissions)
                        )));
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

    protected function getLoginUrl(Request $request): string
    {
        return match ($this->getUrl($request)) {
            self::LOGIN_ROUTE => '/login',
            self::SIGNUP_ROUTE => '/signup',
            default => '/',
        };
    }
}
