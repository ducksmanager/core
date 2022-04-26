const { form: formStore } = require( "../stores/form")

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;

export let validation = (t) => {
  const form = formStore()
  return {
    validatePasswords(password, password2) {
      if (password !== password2) {
        form.addErrors({ password: t("Les deux mots de passe ne correspondent pas !") });
      }
      if (password.length < 6 || password.length < 6) {
        form.addErrors({ password: t("Le mot de passe doit comporter au moins 6 caractères !") });
      }
    },

    validateEmail(email) {
      if (!EMAIL_REGEX.test(email)) {
        form.addErrors({ email: t("L'adresse e-mail est invalide.") });
      }
    },

    validateUsername(signupUsername) {
      if (!USERNAME_REGEX.test(signupUsername)) {
        form.addErrors({ signupUsername: t("Le nom d'utilisateur est invalide. Choisissez un nom d'utilisateur d'au moins 3 caractères contenant seulement des lettres, des chiffres et des tirets.") });
      }
    }
  }
};
