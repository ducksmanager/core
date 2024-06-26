<route lang="yaml">
meta:
  public: true
</route>

<template>
  <div>
    <a href="https://discord.gg/ruk3FsD" target="_blank">
      <div
        id="discord"
        class="mb-4 pt-3"
        :style="{ backgroundImage: `url('${getImagePath('discord.png')}` }"
      >
        {{ $t("Rejoignez la communauté sur") }}
      </div>
    </a>
    <div class="showcase">
      <h2>{{ $t("Bienvenue sur DucksManager !") }}</h2>
      <h5>
        {{
          $t(
            "Le site Internet de référence des collectionneurs de bandes dessinées Disney",
          )
        }}
      </h5>
      <b-row>
        <b-col offset-md="1" lg="5">
          <img :src="getImagePath('demos/montage_small.jpg')" alt="logo" />
        </b-col>
        <b-col lg="5">
          <div>
            {{
              $t(
                "DucksManager est un site Web vous permettant de gérer votre liste de magazines Disney en toute simplicité.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "De la gestion de votre collection à leur impression en tant que liste, en passant par des statistiques complètes, toutes les fonctions que vous attendiez d'un gestionnaire de collection sont là !",
              )
            }}
          </div>
          <div>
            {{ $t("DucksManager est gratuit et sans limite d'utilisation.") }}
          </div>
        </b-col>
      </b-row>
      <hr />
      <b-row>
        <b-col offset-md="1" lg="5">
          <h3>
            {{
              $t(
                "Sélectionnez en quelques clics les numéros que vous possédez !",
              )
            }}
          </h3>
          <div>
            {{
              $t(
                "Notre outil de sélection de numéros permet de référencer votre collection de magazines Disney en toute simplicité.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Envie de mémoriser les moindres détails de votre collection ? Avec DucksManager un clic droit suffit !",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Vous pourrez ainsi spécifier l'état de conservation de vos revues, leurs dates d'acquisition, ou encore les proposer à la vente auprès des autres utilisateurs de DucksManager.",
              )
            }}
          </div>
        </b-col>
        <b-col lg="5">
          <img :src="getImagePath('demos/manage.jpg')" alt="demo_gerer" />
        </b-col>
      </b-row>
      <hr />
      <b-row>
        <b-col offset-md="1" lg="5">
          <video src="/images/demos/bookcase.mp4?new" autoplay muted loop />
        </b-col>
        <b-col lg="5">
          <h3>{{ $t("Votre bibliothèque, comme si vous étiez devant !") }}</h3>
          <div>
            {{
              $t(
                "La bibliothèque de DucksManager présente votre collection de magazines Disney dans des étagères élégantes.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Parce que votre bibliothèque est unique, DucksManager vous propose de choisir entre différents types de bois pour le cadre de la bibliothèque et ses étagères.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "...Et pour que l'immersion soit complète, vous pouvez dans la plupart des cas voir la couverture et quelques extraits de chacun de vos numéros!",
              )
            }}
          </div>
        </b-col>
      </b-row>
      <hr />
      <b-row>
        <b-col offset-md="1" lg="5">
          <h3>
            {{
              $t(
                "Des statistiques complètes et tous les outils pour agrandir votre collection !",
              )
            }}
          </h3>
          <div>
            {{
              $t(
                "Mises à jour quotidiennement pour prendre en compte tous vos changements, les statistiques de DucksManager vous informent sur les numéros que vous possédez, et vous précisent combien en acquérir pour compléter des séries.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Si vous avez spécifié l'état de vos revues, un graphique les résumera.",
              )
            }}
          </div>
          <div>
            {{
              $t(
                "Vous aimez un scénariste ou un dessinateur en particulier ? DucksManager génère pour vous un histogramme résumant la proportion des histoires que vous possédez de cet auteur.",
              )
            }}
          </div>
        </b-col>
        <b-col lg="5">
          <img
            :src="getImagePath('demos/author_stats.png')"
            alt="demo_stats_auteur"
          />
        </b-col>
      </b-row>
      <hr />
      <b-row>
        <b-col offset-md="1" lg="5">
          <video
            src="/images/demos/whattheduck.mp4?new"
            autoplay
            muted
            loop
            height="360"
          />
        </b-col>
        <b-col lg="5">
          <h3>
            {{ $t("Votre collection Disney en poche, où que vous soyez") }}
          </h3>
          <div>
            {{
              $t(
                "Gardez votre collection en poche où que vous soyez, et ajoutez des numéros à votre collection simplement en photographiant leur couverture avec",
              )
            }}&nbsp;<a
              href="https://play.google.com/store/apps/details?id=net.ducksmanager.whattheduck"
              ><b>What The Duck</b></a
            >{{ $t(", l'application mobile de DucksManager !") }}
          </div>
          {{
            $t(
              "Disponible gratuitement sur les téléphones et tablettes Android.",
            )
          }}
        </b-col>
      </b-row>
      <div v-if="!user" id="sign-up-prompt">
        <router-link v-slot="{ href, navigate }" to="/signup" custom>
          <b-button
            size="lg"
            variant="success"
            class="no-border"
            :href="href"
            @click="navigate"
          >
            {{ $t("Cliquez ici pour vous inscrire !") }}
          </b-button></router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
const { t: $t } = useI18n();

const { user } = storeToRefs(collection());
const { getImagePath } = images();

useHead({
  title: $t("Bienvenue sur DucksManager !"),
});
</script>

<style scoped lang="scss">
#discord {
  background-color: #a1aed7;
  background-repeat: no-repeat;
  background-position-x: center;
  background-position-y: 5px;
  background-size: contain;
  color: white;
  height: 90px;
  font-size: 20px;
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

  h2,
  h5 {
    text-align: center;
  }

  hr {
    opacity: 0.8;
    width: 50%;
    -webkit-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.75);
    -moz-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.75);
    box-shadow: 0 1px 2px 0 rgba(255, 255, 255, 0.75);
  }

  img,
  video {
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
