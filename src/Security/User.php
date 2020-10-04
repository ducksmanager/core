<?php
namespace App\Security;

use Symfony\Component\Security\Core\User\UserInterface;

class User implements UserInterface
{
    private int $id;
    private string $username;
    private string $password;
    private array $roles;

    public function __construct(int $id, string $username, string $password, array $roles)
    {
        $this->id = $id;
        $this->username = $username;
        $this->password = $password;
        $this->roles = $roles;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getUsername()
    {
        return $this->username;
    }

    public function getPassword()
    {
        return $this->password ?? null;
    }

    public function getRoles()
    {
        return $this->roles;
    }

    public function getSalt()
    {
    }

    public function eraseCredentials()
    {
    }
}