<template>
  <span>
    <span
      :id="`user-${id}`"
      class="username"
    >{{ username }}</span>
    <b-popover
      :target="`user-${id}`"
      triggers="hover"
      :delay="0"
    >
      <h4>{{ username }}</h4>
      <Medal
        v-for="level in points"
        :key="level.contribution"
        :level="level"
        small
      />
      <div class="clearfix" />
      <div>
        5 {{ l10n.NUMEROS }}<br>
        1 {{ l10n.MAGAZINES }}<br>
        1 {{ l10n.PAYS }}
      </div>
      <div
        v-if="bookcaseShared"
        class="bookcase-link"
      >
        <img :src="`${imagePath}/bibliotheque.png`">&nbsp;
        <b-button
          size="xs"
          variant="outline-secondary"
        >
          <a
            target="_blank"
            :href="`/?action=bibliotheque&user=${username}`"
          >{{ l10n.VOIR_BIBLIOTHEQUE }}</a>
        </b-button>
      </div>
    </b-popover>
  </span>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";
import Medal from "../layouts/Medal";

export default {
  name: "User",
  components: {
    Medal
  },
  mixins: [l10nMixin],
  props: {
    id: {type: Number, required: true},
    points: {type: Array, required: true}
  },

  data: () => ({
    bookcaseShared: true,
    username: 'test'
  }),

  computed: {
    imagePath: () => window.imagePath
  }
}
</script>

<style scoped lang="scss">
.username {
  font-weight: bold;
  font-style: italic;
  cursor: help;
}
.bookcase-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
  white-space: nowrap;

  img {
    height: 32px;
  }

  a {
    border: none;
  }
}
</style>