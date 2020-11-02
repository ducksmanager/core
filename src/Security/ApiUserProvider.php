<?php
namespace App\Security;

use App\Service\ApiService;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class ApiUserProvider implements UserProviderInterface, PasswordUpgraderInterface
{
    private ApiService $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function loadUserByUsername(string $username)
    {
        $apiUser = $this->apiService->call("/ducksmanager/user/$username", 'ducksmanager');
        if ($apiUser) {
            return new User($apiUser['id'], $apiUser['username'], $apiUser['password'], []);
        }

        throw new UsernameNotFoundException("Username not found : $username");
    }

    public function refreshUser(UserInterface $user)
    {
        return $user;
    }

    public function supportsClass(string $class)
    {
        return User::class === $class;
    }

    public function upgradePassword(UserInterface $user, string $newEncodedPassword): void
    {
        $user->setPassword($newEncodedPassword);
    }
}