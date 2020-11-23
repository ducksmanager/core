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
            v-model="username"
            name="username"
            type="text"
            required
            autofocus
            :placeholder="l10n.NOM_UTILISATEUR"
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
            :placeholder="l10n.ADRESSE_EMAIL"
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
            :placeholder="l10n.MOT_DE_PASSE_6_CHAR"
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
            :placeholder="l10n.MOT_DE_PASSE_CONF"
          />
        </Errorable>
      </b-col>
    </b-row>

    <b-btn
      variant="primary"
      size="xl"
      type="submit"
    >
      {{ l10n.INSCRIPTION }}
    </b-btn>
  </form>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import * as axios from "axios";
import validationMixin from "../mixins/validationMixin";
import {mapGetters, mapMutations} from "vuex";
import Errorable from "../components/Errorable";


export default {
  name: "Signup",
  components: {Errorable},
  mixins: [l10nMixin, validationMixin],
  props: {
    lastUsername: {type: String, default: null}
  },

  data: () => ({
    username: '',
    email: '',
    password: '',
    password2: '',
  }),

  computed: {
    ...mapGetters("form", ["hasErrors"])
  },

  mounted() {
    this.username = this.lastUsername;
  },

  methods: {
    ...mapMutations("form", ["clearErrors"]),

    async signup() {
      this.clearErrors()
      this.validatePasswords()
      this.validateEmail()
      this.validateUsername()
      if (this.hasErrors) {
        return
      }
      try {
        await axios.put('/signup', {
          username: this.username,
          password: this.password,
          password2: this.password2,
          email: this.email
        })
        window.location.replace('/collection/show')
      }
      catch(e) {
        this.addErrors({username: this.l10n.ERREUR_UTILISATEUR_OU_EMAIL_EXISTANT})
      }
    }
  }
}
</script>

<style scoped>

</style>