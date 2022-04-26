<template>
  <form
    method="post"
    @submit.prevent="signup"
  >
    <b-row>
      <b-col lg="4">
        <Errorable id="username">
          <b-form-input
            id="username"
            v-model="signupUsername"
            name="username"
            type="text"
            required
            autofocus
            :placeholder="$t(`Nom d'utilisateur`)"
          />
        </Errorable>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <Errorable id="email">
          <b-form-input
            id="email"
            v-model="email"
            name="email"
            type="text"
            required
            :placeholder="$t('Adresse e-mail')"
          />
        </Errorable>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <Errorable id="password">
          <b-form-input
            id="password"
            v-model="password"
            name="password"
            type="password"
            required
            :placeholder="$t('Mot de passe (au moins 6 caractères)')"
          />
        </Errorable>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <Errorable id="password2">
          <b-form-input
            id="password2"
            v-model="password2"
            name="password2"
            type="password"
            required
            :placeholder="$t('Mot de passe (confirmation)')"
          />
        </Errorable>
      </b-col>
    </b-row>

    <b-button
      variant="primary"
      size="xl"
      type="submit"
    >
      {{ $t("Inscription") }}
    </b-button>
  </form>
</template>

<script>
import * as axios from "axios";
import Errorable from "../components/Errorable";
import {BButton, BCol, BFormInput, BRow} from "bootstrap-vue-3";
import { mapState, mapActions } from "pinia";
import { form } from "../stores/form";
import { l10n } from "../stores/l10n";
import { validation } from "../composables/validation";
import { useI18n } from "vue-i18n";

let t

export default {
  name: "Signup",
  components: { Errorable, BRow, BCol, BFormInput, BButton },
  props: {
    lastUsername: { type: String, default: null }
  },

  data: () => ({
    signupUsername: "",
    email: "",
    password: "",
    password2: ""
  }),

  computed: {
    ...mapState(form, ["hasErrors"])
  },

  mounted() {
    this.signupUsername = this.lastUsername;
    t = useI18n().t
  },

  methods: {
    ...mapActions(l10n, ["$r"]),
    ...mapActions(form, ["clearErrors"]),

    async signup() {
      const {validatePasswords, validateEmail, validateUsername} = validation(t)

      this.clearErrors();
      validatePasswords(this.password, this.password2);
      validateEmail(this.email);
      validateUsername(this.signupUsername);

      if (this.hasErrors) {
        return;
      }
      try {
        await axios.put("/signup", {
          username: this.signupUsername,
          password: this.password,
          password2: this.password2,
          email: this.email
        });
        window.location.replace(this.$r("/collection/show"));
      } catch (e) {
        this.addErrors({ username: this.$t("Ce nom d'utilisateur ou cette adresse e-mail existe déjà.") });
      }
    }
  }
};
</script>

<style scoped>

</style>
