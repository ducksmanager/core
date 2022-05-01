<?php
namespace App\Security;

use App\Service\ApiService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class ApiUserProvider implements UserProviderInterface, PasswordUpgraderInterface
{
    private ApiService $apiService;
    private LoggerInterface $logger;

    public function __construct(ApiService $apiService, LoggerInterface $logger)
    {
        $this->apiService = $apiService;
        $this->logger = $logger;
    }

    public function loadUserByUsername(string $username)
    {
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
