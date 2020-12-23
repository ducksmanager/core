import {mapMutations} from "vuex";
import l10nMixin from "./l10nMixin";

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/

const USERNAME_REGEX = /^[-_A-Za-z0-9]{3,15}$/

export default {
    data: () => ({
        errors: []
    }),

    mixins: [l10nMixin],

    methods: {
        ...mapMutations("form", ["addErrors"]),

        validatePasswords() {
            if (this.password !== this.password2) {
                this.addErrors({password: this.l10n.MOTS_DE_PASSE_DIFFERENTS})
            }
            if (this.password.length < 6 || this.password.length < 6) {
                this.addErrors({password: this.l10n.MOT_DE_PASSE_6_CHAR_ERREUR})
            }
        },

        validateEmail() {
            if (!EMAIL_REGEX.test(this.email)) {
                this.addErrors({email: this.l10n.EMAIL_INVALIDE})
            }
        },

        validateUsername() {
            if (!USERNAME_REGEX.test(this.signupUsername)) {
                this.addErrors({signupUsername: this.l10n.UTILISATEUR_INVALIDE})
            }
        }
    }
}
