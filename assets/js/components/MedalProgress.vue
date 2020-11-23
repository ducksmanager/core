<template>
  <div class="progress-wrapper">
    <Medal
      class="left"
      x-small
      :user-level-points="userLevelPoints"
      :contribution="contribution"
      target-level
    />
    <b-progress>
      <b-progress-bar
        class="progress-current"
        :style="{width: `${medalProgressCurrentPercentage}%`}"
      />
      <b-progress-bar
        class="progress-extra"
        striped
        animated
        variant="success"
        :style="{width: `${getLevelProgressPercentage(extraPoints)}%`}"
      >
        + {{ extraPoints }} {{ l10n.POINTS }}
      </b-progress-bar>
    </b-progress>
    <Medal
      class="right"
      x-small
      :user-level-points="userLevelPoints"
      :contribution="contribution"
      target-level
      next-level
    />
  </div>
</template>
<script>
import Medal from "./Medal";
import medalMixin from "../mixins/medalMixin";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "MedalProgress",
  components: {Medal},

  mixins: [l10nMixin, medalMixin],

  props: {
    contribution: {
      type: String,
      default: 'Photographe'
    },
    userLevelPoints: {
      type: Number,
      required: true
    },
    extraPoints: {
      type: Number,
      required: true
    }
  },

  computed: {
    imagePath: () => window.imagePath
  }
}
</script>

<style lang="scss">
.carousel-caption {
  padding-left: 35px;
  padding-right: 35px;

  .progress-wrapper {
    margin: 12px 0;

    .progress {
      height: 1.5rem;
      font-size: 1rem;
      margin: 0 25px;

      .progress-current {
        background-color: lightgreen !important;
      }

      .progress-extra {
        color: rgb(40, 40, 40) !important;
        background-image: linear-gradient(135deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
        text-shadow: 1px 1px 2px lightgrey;
        white-space: nowrap;
        overflow-x: visible;
        animation-direction: reverse;
      }
    }
  }
}

.carousel-indicators {
  top: 0;
  bottom: initial;
}
</style>