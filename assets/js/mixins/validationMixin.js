import l10nMixin from "./l10nMixin";
import { mapActions } from "pinia";
import { form } from "../stores/form";

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/;

export default {
  data: () => ({
    errors: []
  }),

  mixins: [l10nMixin],

  methods: {
    ...mapActions(form, ["addErrors"]),

    validatePasswords() {
      if (this.password !== this.password2) {
        this.addErrors({ password: this.$t("Les deux mots de passe ne correspondent pas !") });
      }
      if (this.password.length < 6 || this.password.length < 6) {
        this.addErrors({ password: this.$t("Le mot de passe doit comporter au moins 6 caractères !") });
      }
    },

    validateEmail() {
      if (!EMAIL_REGEX.test(this.email)) {
        this.addErrors({ email: this.$t("L'adresse e-mail est invalide.") });
      }
    },

    validateUsername() {
      if (!USERNAME_REGEX.test(this.signupUsername)) {
        this.addErrors({ signupUsername: this.$t("Le nom d'utilisateur est invalide. Choisissez un nom d'utilisateur d'au moins 3 caractères contenant seulement des lettres, des chiffres et des tirets.") });
      }
    }
  }
};
