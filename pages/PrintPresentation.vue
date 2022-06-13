<template>
  <div>
    {{
      $t(
        "DucksManager propose l'impression de votre liste sous deux formats différents :"
      )
    }}
    <ul>
      <li
        v-for="type in types"
        :key="type.link"
        class="print-type"
        :style="{ backgroundImage: `url(${imagePath}/lists/${type.link}.png)` }"
      >
        <span v-if="type.exclusive" class="exclusive">{{
          $t("Exclusif DucksManager")
        }}</span>
        <span v-html="type.description" />
        <ul class="details">
          <li v-for="detail in type.details" :key="detail" class="detail">
            {{ detail }}
          </li>
          <li v-if="type.link === 'collectable'">
            <a
              href="http://www.youtube.com/watch?v=PAg-g1cF148&hd=1"
              target="_blank"
              >{{ $t("Cliquez ici") }}</a
            >
            {{
              $t(
                "pour visionner notre vidéo d'explication du fonctionnement de la CollecTable en 1 minute 30 chrono !"
              )
            }}
          </li>
        </ul>
        <a :href="r(`/print/{currentType:${type.link}}`)" target="_blank"
          >{{ $t("Imprimer ma collection avec") }} {{ type.name }}</a
        >
        <br />
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

import { imagePath } from "../composables/imagePath";
import { l10n } from "../stores/l10n";

const { t: $t } = useI18n();
const types = [
  {
    link: "classic",
    name: $t("la liste classique"),
    description: $t(
      "Une <b>liste classique</b>, répertoriant pour chaque magazine les numéros que vous possédez."
    ),
    details: [
      $t("Ce type de liste est plus adapté pour les petites collections."),
      $t(
        "Facile à lire, cette liste devient vite illisible lorsqu'il s'agit d'ajouter des numéros."
      ),
    ],
  },
  {
    link: "collectable",
    name: $t("CollecTable"),
    exclusive: true,
    description: $t(
      "Une <b>liste CollecTable</b>, plus synthétique mais demandant un peu d'entraînement !"
    ),
    details: [$t("Adaptée pour les grandes collections.")],
  },
];
const { r } = l10n();
</script>

<style lang="scss" scoped>
ul {
  margin: 20px 0;

  &.details {
    li {
      margin-top: 10px;
    }
  }

  > li.print-type {
    list-style: none;
    min-height: 150px;
    margin-bottom: 30px;
    padding-left: 170px;
    padding-top: 12px;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: left center;
    min-width: 150px;

    ul li.detail {
      margin-top: 14px;
    }

    .exclusive {
      border: 1px solid #c88964;
      padding: 3px;
      margin-right: 5px;
      color: #c88964;
      white-space: nowrap;
    }
  }
}
</style>
