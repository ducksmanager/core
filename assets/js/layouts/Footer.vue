<template>
  <div id="footer">
    <div
      v-show="count"
      id="user-count"
      v-html="
        $t('{0} utilisateurs sont inscrits<br />sur DucksManager', [count])
      "
    />
    <div>
      {{
        $t(
          "Les logos de DucksManager et de WhatTheDuck ont été réalisés par enigm."
        )
      }}
      <br /><br />
      {{ $t("Ce site se base en partie sur les données du site Inducks.") }}
      <a target="_blank" href="http://coa.inducks.org/inducks/COPYING">{{
        $t("Cliquez ici pour lire la licence Inducks.")
      }}</a>
      <br />
      {{
        $t(
          "Toutes les images de personnages et / ou produits Disney: © The  Walt Disney Company."
        )
      }}
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { users } from "../stores/users";

export default {
  name: "Footer",
  computed: {
    ...mapState(users, ["count"]),
  },

  async mounted() {
    await this.fetchCount();
  },

  methods: {
    ...mapActions(users, ["fetchCount"]),
  },
};
</script>

<style scoped lang="scss">
#footer {
  height: 125px;
  border-top: 1px solid white;
  padding: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  > * {
    text-align: center;
  }
}

#user-count {
  text-align: center;
  vertical-align: middle;
  padding-left: 4px;
}
</style>
