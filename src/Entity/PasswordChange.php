<?php

namespace App\Entity;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Mapping\ClassMetadata;
use Symfony\Contracts\Translation\TranslatorInterface;

class PasswordChange
{
    private static TranslatorInterface $translator;
    private $token = null;
    private $password = null;
    private $passwordConfirmation = null;

    public static function createFromRequest(TranslatorInterface $translator, Request $request, string $token): PasswordChange
    {
        self::$translator = $translator;
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
        $metadata->addPropertyConstraint('password', new Length(['min' => 6, 'minMessage' => self::$translator->trans('MOT_DE_PASSE_6_CHAR_ERREUR')]));
    }

    public function validatePasswordEqualsPasswordConfirmation(ExecutionContextInterface $context)
    {
        if ($this->password !== $this->passwordConfirmation) {
            $context->buildViolation(self::$translator->trans('MOTS_DE_PASSE_DIFFERENTS'))
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