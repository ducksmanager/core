<?php

namespace App\Entity;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Mapping\ClassMetadata;

class Account
{
    private ?string $currentPassword;
    private ?string $currentPresentationSentence;

    private ?string $email = null;
    private ?string $password = null;
    private ?string $passwordNew = null;
    private ?string $passwordNewConfirmation = null;
    private ?string $presentationSentenceRequest = null;
    private bool|string $isShareEnabled = false;
    private bool|string $isVideoShown = false;

    public static function createFromRequest(Request $request, array $user): Account
    {
        $object = new Account();
        foreach ($request->request->all() as $field => $value) {
            if (!empty($value)) {
                $object->$field = $value;
            }
        }
        $object->currentPassword = $user['password'];
        $object->currentPresentationSentence = $user['presentationSentence'];
        return $object;
    }

    public static function loadValidatorMetadata(ClassMetadata $metadata)
    {
        $metadata->addPropertyConstraint('email', new NotBlank());
        $metadata->addPropertyConstraint('presentationSentenceRequest', new Length(null, null, 100));

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
            $context->buildViolation("L'ancien mot de passe est invalide.")
                ->atPath('password')
                ->addViolation();
        }
    }

    public function hasRequestedPresentationSentence() : bool {
        return !empty($this->presentationSentenceRequest) && $this->presentationSentenceRequest !== $this->currentPresentationSentence;
    }

    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'presentationSentenceRequest' => $this->hasRequestedPresentationSentence() ? $this->presentationSentenceRequest : null,
            'password' => $this->getUpToDatePassword(),
            'isShareEnabled' => $this->isShareEnabled === 'true',
            'isVideoShown' => $this->isVideoShown === 'true',
        ];
    }

    public function getUpToDatePassword() : string {
        return is_null($this->passwordNew ?? $this->password) ? $this->currentPassword : sha1($this->passwordNew ?? $this->password);
    }
}
