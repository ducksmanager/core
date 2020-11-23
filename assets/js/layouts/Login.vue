<template>
  <form method="post">
    <h1 class="h3 mb-3 font-weight-normal">
      {{ l10n.CONNEXION }}
    </h1>
    <b-alert
      v-if="error"
      show
      variant="danger"
    >
      {{ error }}
    </b-alert>
    <b-form-input
      id="username"
      name="username"
      type="text"
      required
      autofocus
      :value="lastUsername"
      :placeholder="l10n.NOM_UTILISATEUR"
    />
    <b-form-input
      id="password"
      name="password"
      type="password"
      required
      :placeholder="l10n.MOT_DE_PASSE"
    />

    <input
      type="hidden"
      name="_csrf_token"
      :value="csrfToken"
    >

    <b-btn
      variant="primary"
      size="xl"
      type="submit"
    >
      {{ l10n.CONNEXION }}
    </b-btn>
    <div>
      <a :href="$r('/forgot')">{{ l10n.MOT_DE_PASSE_OUBLIE }}</a>
    </div>
  </form>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Login",
  mixins: [l10nMixin],
  props: {
    error: {type: String, default: null},
    lastUsername: {type: String, default: null}
  },
  data() {
    return {
      csrfToken: document.getElementById('csrf').value
    }
  }
}
</script>

<style scoped>

</style>