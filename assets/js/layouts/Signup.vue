<template>
  <form
    v-if="l10n"
    method="post"
  >
    <b-alert
      v-if="isSuccess === false"
      show
      variant="danger"
    >
      {{ l10n.ERREUR_GENERIQUE }}
    </b-alert>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="username"
          name="username"
          type="text"
          required
          autofocus
          :value="lastUsername"
          :placeholder="l10n.NOM_UTILISATEUR"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="email"
          name="email"
          type="text"
          required
          :placeholder="l10n.ADRESSE_EMAIL"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="password"
          name="password"
          type="password"
          required
          :placeholder="l10n.MOT_DE_PASSE_6_CHAR"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col lg="4">
        <b-form-input
          id="password2"
          name="password2"
          type="password"
          required
          :placeholder="l10n.MOT_DE_PASSE_CONF"
        />
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

export default {
  name: "Signup",
  mixins: [l10nMixin],
  props: {
    success: {type: String, default: null},
    lastUsername: {type: String, default: null}
  },

  computed: {
    isSuccess() {
      return this.success === null ? null : parseInt(this.success) === 1
    }
  }
}
</script>

<style scoped>

</style>