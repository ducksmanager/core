<template>
  <form
    method="post"
    @submit.prevent="signup"
  >
    <input
      type="hidden"
      name="_csrf_token"
      :value="csrfToken"
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
import l10nMixin from "../mixins/l10nMixin";
import * as axios from "axios";
import validationMixin from "../mixins/validationMixin";
import Errorable from "../components/Errorable";
import {BButton, BCol, BFormInput, BRow} from "bootstrap-vue";
import { mapState, mapActions } from "pinia";
import { form } from "../stores/form";

export default {
  name: "Signup",
  components: { Errorable, BRow, BCol, BFormInput, BButton },
  mixins: [l10nMixin, validationMixin],
  props: {
    lastUsername: { type: String, default: null }
  },

  data: () => ({
    signupUsername: "",
    email: "",
    password: "",
    password2: "",
    csrfToken: document.getElementById("csrf").value
  }),

  computed: {
    ...mapState(form, ["hasErrors"])
  },

  mounted() {
    this.signupUsername = this.lastUsername;
  },

  methods: {
    ...mapActions(form, ["clearErrors"]),

    async signup() {
      this.clearErrors();
      this.validatePasswords();
      this.validateEmail();
      this.validateUsername();
      if (this.hasErrors) {
        return;
      }
      const bodyFormData = new FormData();
      bodyFormData.append('username', this.signupUsername)
      bodyFormData.append('password', this.password)
      bodyFormData.append('password2',this.password2)
      bodyFormData.append('email', this.email)
      bodyFormData.append('_csrf_token', this.csrfToken)
      try {
        await axios.post("/signup", bodyFormData, { headers: { "Content-Type": "multipart/form-data" } });
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
