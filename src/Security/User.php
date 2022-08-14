<?php
namespace App\Security;

use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    private int $id;
    private string $username;
    private string $password;
    private array $roles;

    public function __construct(int $id, string $username, string $password, array $roles)
    {
        $this->id = $id;
        $this->username = $username;
        $this->setPassword($password);
        $this->roles = $roles;
    }

    public function getUserIdentifier(): string
    {
        return $this->username;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getPassword(): ?string
    {
        return $this->password ?? null;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function getSalt()
    {
    }

    public function eraseCredentials()
    {
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        $_SESSION['pass'] = $password;
        return $this;
    }
}
