<?php
namespace App\Security;

use App\Service\ApiService;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class User implements UserInterface
{
    private string $username;
    private array $roles;

    public function __construct(string $username, array $roles)
    {
        $this->username = $username;
        $this->roles = $roles;
    }


    public function getRoles()
    {
        return $this->roles;
    }

    public function getPassword()
    {
        return null;
    }

    public function getSalt()
    {
    }

    public function getUsername()
    {
        return $this->username;
    }

    public function eraseCredentials()
    {
    }
}