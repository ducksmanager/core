<?php

namespace App\Entity;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Mapping\ClassMetadata;

class PasswordChange
{
    private $token = null;
    private $password = null;
    private $passwordConfirmation = null;

    public static function createFromRequest(Request $request, string $token): PasswordChange
    {
        $object = new PasswordChange();
        foreach ($request->request->all() as $field => $value) {
            if (!empty($value)) {
                $object->$field = $value;
            }
        }
        $object->token = $token;
        return $object;
    }

    public static function loadValidatorMetadata(ClassMetadata $metadata)
    {
        $metadata->addConstraint(new Callback('validatePasswordEqualsPasswordConfirmation'));
        $metadata->addPropertyConstraint('password', new Length(['min' => 6, 'minMessage' => 'Le mot de passe doit comporter au moins 6 caractères !']));
    }

    public function validatePasswordEqualsPasswordConfirmation(ExecutionContextInterface $context)
    {
        if ($this->password !== $this->passwordConfirmation) {
            $context->buildViolation('Les deux mots de passe ne correspondent pas !')
                ->atPath('password')
                ->addViolation();
        }
    }

    public function toArray(): array
    {
        return [
            'password' => $this->password ?? null,
            'token' => $this->token
        ];
    }
}
