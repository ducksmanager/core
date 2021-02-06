<?php

namespace App\Entity;

use App\Security\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Mapping\ClassMetadata;
use Symfony\Contracts\Translation\TranslatorInterface;

class Account
{
    private $currentPassword;

    private $email = null;
    private $password = null;
    private $passwordNew = null;
    private $passwordNewConfirmation = null;
    private $isShareEnabled = false;
    private $isVideoShown = false;

    public static function createFromRequest(Request $request, User $user): Account
    {
        $object = new Account();
        foreach ($request->request->all() as $field => $value) {
            if (!empty($value)) {
                $object->$field = $value;
            }
        }
        $object->currentPassword = $user->getPassword();
        return $object;
    }

    public static function loadValidatorMetadata(ClassMetadata $metadata)
    {
        $metadata->addPropertyConstraint('email', new NotBlank());

        $metadata->addConstraint(new Callback('validateOldPasswordNotBlankIfNewPasswordNotBlank'));
        $metadata->addConstraint(new Callback('validateNewPasswordEqualsNewPasswordConfirmation'));
        $metadata->addConstraint(new Callback('validateOldPassword'));
    }

    public function validateNewPasswordEqualsNewPasswordConfirmation(ExecutionContextInterface $context)
    {
        if ($this->passwordNew !== $this->passwordNewConfirmation) {
            $context->buildViolation('Les deux mots de passe ne correspondent pas !')
                ->atPath('passwordNew')
                ->addViolation();
        }
    }

    public function validateOldPasswordNotBlankIfNewPasswordNotBlank(ExecutionContextInterface $context)
    {
        if (empty($this->password) !== empty($this->passwordNew)) {
            $context->buildViolation('L\'ancien et le nouveau mot de passe doivent être renseignés si vous souhaitez changer votre mot de passe.')
                ->atPath('passwordNew')
                ->addViolation();
        }
    }

    public function validateOldPassword(ExecutionContextInterface $context)
    {
        if (!empty($this->password) && sha1($this->password) !== $this->currentPassword) {
            $context->buildViolation("This value should be the user's current password.")
                ->atPath('password')
                ->addViolation();
        }
    }

    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'password' => is_null($this->passwordNew ?? $this->password) ? null : sha1($this->passwordNew ?? $this->password),
            'isShareEnabled' => $this->isShareEnabled === 'true',
            'isVideoShown' => $this->isVideoShown === 'true',
        ];
    }

    public function getUpToDatePassword() : string {
        return sha1($this->passwordNew ?? $this->password);
    }
}
