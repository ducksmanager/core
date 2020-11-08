<template>
  <form
    v-if="l10n && user"
    method="post"
  >
    <b-alert
      v-if="isSuccess"
      variant="success"
    >
      {{ l10n.OK }} !
    </b-alert>

    <h5>{{ l10n.ADRESSE_EMAIL }}</h5>
    <Errorable id="email">
      <b-form-input
        id="email"
        v-model="user.email"
        name="email"
        required
        autofocus
      />
    </Errorable>
    <h5>{{ l10n.MOT_DE_PASSE_CHANGEMENT }}</h5>
    <Errorable id="password">
      <b-form-input
        id="password"
        name="password"
        type="password"
        :placeholder="l10n.MOT_DE_PASSE_ACTUEL"
      />
    </Errorable>
    <Errorable id="passwordNew">
      <b-form-input
        id="passwordNew"
        name="passwordNew"
        type="password"
        :placeholder="l10n.MOT_DE_PASSE_NOUVEAU"
      />
    </Errorable>
    <Errorable id="passwordNewConfirmation">
      <b-form-input
        id="passwordNewConfirmation"
        name="passwordNewConfirmation"
        type="password"
        :placeholder="l10n.MOT_DE_PASSE_NOUVEAU_CONFIRMATION"
      />
    </Errorable>

    <h5>{{ l10n.OPTIONS }}</h5>
    <b-form-checkbox
      id="share-enabled"
      v-model="user.isShareEnabled"
      name="isShareEnabled"
    >
      {{ l10n.ACTIVER_PARTAGE }}
    </b-form-checkbox>

    <b-form-checkbox
      id="show-video"
      v-model="user.isVideoShown"
      name="isVideoShown"
    >
      {{ l10n.AFFICHER_VIDEO }}
    </b-form-checkbox>

    <b-btn
      variant="success"
      size="xl"
      type="submit"
    >
      {{ l10n.VALIDER }}
    </b-btn>
  </form>
</template>

<script>
import l10nMixin from "../../mixins/l10nMixin";
import Errorable from "../../components/Errorable";
import {mapActions, mapMutations, mapState} from "vuex";

export default {
  name: "Account",
  components: {Errorable},
  mixins: [l10nMixin],
  props: {
    errors: {type: String, default: ''},
    success: {type: String, default: null},
  },

  data() {
    return {
      user: null
    }
  },

  computed: {
    ...mapState("collection", ["user"]),
    isSuccess() {
      return this.success === null ? null : parseInt(this.success) === 1
    }
  },

  async mounted() {
    await this.loadUser()
    this.setErrors(JSON.parse(this.errors))
  },

  methods: {
    ...mapMutations("form", ["setErrors"]),
    ...mapActions("collection", ["loadUser"])
  },
}
</script>

<style scoped lang="scss">
h5, .btn {
  margin-top: 20px;
}
</style>