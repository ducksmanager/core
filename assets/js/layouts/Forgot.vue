<template>
  <b-alert
    v-if="isSuccess"
    show
    variant="info"
  >
    {{ l10n.MOT_DE_PASSE_OUBLIE_OK }}
  </b-alert>
  <form
    v-else
    method="post"
  >
    <b-alert
      v-if="isSuccess === false"
      show
      variant="danger"
    >
      {{ l10n.MOT_DE_PASSE_OUBLIE_ERREUR }}
    </b-alert>
    {{ l10n.MOT_DE_PASSE_OUBLIE_EXPLICATION }}
    <b-form-row>
      <b-col sm="6">
        <b-form-input
          id="email"
          name="email"
          type="text"
          required
          autofocus
          :placeholder="l10n.ADRESSE_EMAIL"
        />
      </b-col>
      <b-col sm="4">
        <b-btn type="submit">
          {{ l10n.ENVOYER }}
        </b-btn>
      </b-col>
    </b-form-row>
  </form>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Forgot",
  mixins: [l10nMixin],
  props: {
    success: {type: Boolean, default: null}
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