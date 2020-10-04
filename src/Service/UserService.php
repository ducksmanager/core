<?php
namespace App\Service;

class UserService
{
    public function getCurrentUserId() : ?string {
        @session_start();
        return $_COOKIE['dm-user'] ?? $_COOKIE['user'] ?? $_SESSION['user'] ?? null;
    }
    public function getCurrentUsername() : ?string {
        @session_start();
        return $_COOKIE['dm-user'] ?? $_COOKIE['user'] ?? $_SESSION['user'] ?? null;
    }

    public function getCurrentPassword() : ?string {
        @session_start();
        return $_COOKIE['dm-pass'] ?? $_COOKIE['pass'] ?? $_SESSION['pass'] ?? null;
    }

}