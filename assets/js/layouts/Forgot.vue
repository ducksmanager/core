<template>
  <div>
    <b-alert
      v-if="isSuccess"
      show
      variant="info"
      v-html="token ? l10n.MOT_DE_PASSE_CHANGE : l10n.MOT_DE_PASSE_OUBLIE_OK"
    />
    <form
      v-else
      method="post"
    >
      <b-alert
        v-if="isSuccess === false"
        show
        variant="danger"
        v-html="token ? l10n.ERREUR_GENERIQUE : l10n.MOT_DE_PASSE_OUBLIE_ERREUR"
      />
      <template v-if="(isSuccess === false && parsedErrors.length) || isSuccess === null">
        <div v-if="token">
          <Errorable id="password">
            <b-form-input
              id="password"
              name="password"
              type="password"
              :placeholder="l10n.MOT_DE_PASSE_NOUVEAU"
            />
          </Errorable>
          <Errorable id="passwordConfirmation">
            <b-form-input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              :placeholder="l10n.MOT_DE_PASSE_NOUVEAU_CONFIRMATION"
            />
          </Errorable>
        </div>
        <div v-else>
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
          </b-form-row>
        </div>
        <b-form-row>
          <b-col sm="4">
            <b-btn type="submit">
              {{ l10n.ENVOYER }}
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
import {mapMutations} from "vuex";

export default {
  name: "Forgot",
  components: {Errorable},
  mixins: [l10nMixin],
  props: {
    success: {type: String, default: null},
    token: {type: String, default: null},
    errors: {type: String, default: ''},
  },

  computed: {
    isSuccess() {
      return this.success === null ? null : parseInt(this.success) === 1
    },
    parsedErrors() {
      return JSON.parse(this.errors)
    }
  },

  mounted() {
    this.addErrors(JSON.parse(this.errors))
  },

  methods: {
    ...mapMutations("form", ["addErrors"]),
  }
}
</script>

<style scoped>

</style>