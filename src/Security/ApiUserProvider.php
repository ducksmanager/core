<?php
namespace App\Security;

use App\Service\ApiService;
use Symfony\Component\Security\Core\Exception\UsernameNotFoundException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class ApiUserProvider implements UserProviderInterface
{
    private ApiService $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function loadUserByUsername(string $username)
    {
        $roles = $this->apiService->call('/collection/privileges', 'ducksmanager');
        if (is_array($roles)) {
            $internalRoles = [];
            foreach($roles as $role => $privilege) {
                $internalRoles[] = "ROLE_".strtoupper("${role}_$privilege");
            }
            return (new User($username, $internalRoles));
        }
        else {
            throw new UsernameNotFoundException("Username not found : $username");
        }
    }

    public function refreshUser(UserInterface $user)
    {
        return $user;
    }

    public function supportsClass(string $class)
    {
        return User::class === $class;
    }
}