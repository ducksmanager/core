<template>
  <div>
    <b-alert
      v-if="isSuccess"
      show
      variant="info"
      v-html="token
        ? $t('Le mot de passe a été changé. Vous pouvez maintenant vous connecter en vous connectant via le menu.')
        : $t(`Si l'e-mail indiqué correspond à un compte DucksManager, un lien permettant de modifier votre mot de passe vient d'y être envoyé. Si l'e-mail ne vous parvient pas d'ici quelques minutes, pensez à vérifier le dossier Spam.`)"
    />
    <form
      v-else
      method="post"
    >
      <b-alert
        v-if="isSuccess === false"
        show
        variant="danger"
        v-html="token ? $t(`Une erreur s'est produite.`) : $t('Le champ E-mail est invalide, correspond-il à un email enregistré sur DucksManager ?')"
      />
      <template v-if="(isSuccess === false && parsedErrors.length) || isSuccess === null">
        <div v-if="token">
          <Errorable id="password">
            <b-form-input
              id="password"
              name="password"
              type="password"
              :placeholder="$t('Nouveau mot de passe')"
            />
          </Errorable>
          <Errorable id="passwordConfirmation">
            <b-form-input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              :placeholder="$t('Nouveau mot de passe (confirmation)')"
            />
          </Errorable>
        </div>
        <div v-else>
          {{ $t("Un mot de passe temporaire va vous être envoyé à l'adresse e-mail que vous indiquerez ci-dessous.") }}
          <b-form-row>
            <b-col sm="6">
              <b-form-input
                id="email"
                name="email"
                type="text"
                required
                autofocus
                :placeholder="$t('Adresse e-mail')"
              />
            </b-col>
          </b-form-row>
        </div>
        <b-form-row>
          <b-col sm="4">
            <b-btn type="submit">
              {{ $t("Envoyer") }}
            </b-btn>
          </b-col>
        </b-form-row>
      </template>
    </form>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import Errorable from "../components/Errorable";
import { mapMutations } from "vuex";

export default {
  name: "Forgot",
  components: { Errorable },
  mixins: [l10nMixin],
  props: {
    success: { type: String, default: null },
    token: { type: String, default: null },
    errors: { type: String, default: "" }
  },

  computed: {
    isSuccess() {
      return this.success === null ? null : parseInt(this.success) === 1;
    },
    parsedErrors() {
      return JSON.parse(this.errors);
    }
  },

  mounted() {
    this.addErrors(JSON.parse(this.errors));
  },

  methods: {
    ...mapMutations("form", ["addErrors"])
  }
};
</script>

<style scoped>

</style>
