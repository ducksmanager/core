<template>
  <div>
    <a
      href="https://discord.gg/ruk3FsD"
      target="_blank"
    ><div
      id="discord"
      :style="{backgroundImage: `url('${imagePath}/discord.png')`}"
    >{{ l10n.REJOIGNEZ_NOUS }}</div></a>
    <div class="showcase">
      <h2>{{ l10n.BIENVENUE }}</h2>
      <h5>{{ l10n.ACCROCHE }}</h5>
      <b-row>
        <b-col
          offset-md="1"
          lg="5"
        >
          <img
            :src="`${imagePath}/demos/montage_small.jpg`"
            alt="logo"
          >
        </b-col>
        <b-col lg="5">
          <div>{{ l10n.PRESENTATION1 }}</div>
          <div>{{ l10n.PRESENTATION2 }}</div>
          <div>{{ l10n.GRATUIT_AUCUNE_LIMITE }}</div>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col
          offset-md="1"
          lg="5"
        >
          <h3>{{ l10n.PRESENTATION_GERER_TITRE }}</h3>
          <div>{{ l10n.PRESENTATION_GERER_1 }}</div>
          <div>{{ l10n.PRESENTATION_GERER_2 }}</div>
          <div>{{ l10n.PRESENTATION_GERER_3 }}</div>
        </b-col>
        <b-col lg="5">
          <img
            :src="`${imagePath}/demos/manage.jpg`"
            alt="demo_gerer"
          >
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col
          offset-md="1"
          lg="5"
        >
          <video
            :src="`${imagePath}/demos/bookcase.mp4`"
            autoplay
            muted
            loop
          />
        </b-col>
        <b-col lg="5">
          <h3>{{ l10n.PRESENTATION_BIBLIOTHEQUE_TITRE }}</h3>
          <div>{{ l10n.PRESENTATION_BIBLIOTHEQUE_1 }}</div>
          <div>{{ l10n.PRESENTATION_BIBLIOTHEQUE_2 }}</div>
          <div>{{ l10n.PRESENTATION_BIBLIOTHEQUE_3 }}</div>
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col
          offset-md="1"
          lg="5"
        >
          <h3>{{ l10n.PRESENTATION_STATS_TITRE }}</h3>
          <div>{{ l10n.PRESENTATION_STATS_1 }}</div>
          <div>{{ l10n.PRESENTATION_STATS_2 }}</div>
          <div>{{ l10n.PRESENTATION_STATS_3 }}</div>
        </b-col>
        <b-col lg="5">
          <img
            :src="`${imagePath}/demos/author_stats.png`"
            alt="demo_stats_auteur"
          >
        </b-col>
      </b-row>
      <hr>
      <b-row>
        <b-col
          offset-md="1"
          lg="5"
        >
          <video
            :src="`${imagePath}/demos/whattheduck.mp4`"
            autoplay
            muted
            loop
          />
        </b-col>
        <b-col lg="5">
          <h3>{{ l10n.PRESENTATION_WHATTHEDUCK_TITRE }}</h3>
          <div>
            {{ l10n.PRESENTATION_WHATTHEDUCK_1 }}&nbsp;<a
              href="https://play.google.com/store/apps/details?id=net.ducksmanager.whattheduck"
            ><b>What The Duck</b></a>{{ l10n.PRESENTATION_WHATTHEDUCK_2 }}
          </div>
          {{ l10n.PRESENTATION_WHATTHEDUCK_3 }}
        </b-col>
      </b-row>
      <div
        v-if="!username"
        id="sign-up-prompt"
      >
        <b-btn
          size="xl"
          variant="success"
          class="no-border"
          :href="$r('/signup')"
        >
          {{ l10n.INSCRIVEZ_VOUS }}
        </b-btn>
      </div>
    </div>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Welcome",

  mixins: [l10nMixin],

  computed: {
    imagePath: () => window.imagePath,
    username: () => window.username
  }
}
</script>

<style scoped lang="scss">
#discord {
  margin-bottom: 15px;
  padding-top: 15px;
  background-color: #7289d9;
  background-repeat: no-repeat;
  background-position: center;
  color: white;
  height: 140px;
  font-size: 22px;
  font-family: sans-serif;
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
}

.showcase {
  display: block;
  margin-right: auto;
  margin-left: auto;
  max-width: 960px;
  font-size: 14px;
  line-height: 20px;

  h2, h5 {
    text-align: center;
  }

  hr {
    opacity: 0.8;
    width: 50%;
    -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.75);
    box-shadow: 0 1px 2px 0 rgba(255, 255, 255, 0.75);
  }

  img, video {
    max-width: 100%;
    -webkit-box-shadow: 0 0 10px 10px rgba(255, 255, 255, 0.3);
    -moz-box-shadow: 0 0 10px 10px rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px 10px rgba(255, 255, 255, 0.3);
  }

  h3 {
    margin-top: 10px;
  }

  .row {
    min-height: 300px;
    margin-top: 50px;
    margin-bottom: 50px;

    &:first-child {
      margin-top: 10px;
    }

    > div {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
    }
  }
}
#sign-up-prompt {
  margin-right: 6px;
  text-align: center;
}

.no-border {
  border-bottom: 0 !important;
  &:hover {
    border-bottom: 0 !important;
  }
}
</style>