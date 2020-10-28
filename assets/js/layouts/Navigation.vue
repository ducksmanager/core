<template>
  <ul
    v-if="l10n"
    id="menu-content"
    class="menu-content collapse show"
  >
    <NavigationItemGroup
      path="collection"
      icon="glyphicon-home"
    >
      <template #text>
        <b-icon-house-fill />
        {{ l10n.COLLECTION }}
      </template>
      <template #items>
        <template v-if="username">
          <NavigationItem path="/bookcase">
            <b-icon-book-half />
            {{ l10n.BIBLIOTHEQUE_COURT }}
          </NavigationItem>
          <NavigationItem path="/collection/show">
            <b-icon-list />
            {{ l10n.GERER_COLLECTION }}
          </NavigationItem>
          <NavigationItem path="/stats/publications">
            <b-icon-graph-up />
            {{ l10n.STATISTIQUES_COLLECTION }}
          </NavigationItem>
          <NavigationItem path="/expand">
            <b-icon-capslock-fill />
            {{ l10n.AGRANDIR_COLLECTION }}
          </NavigationItem>
          <NavigationItem path="/inducks/import">
            <div
              class="b-custom"
              :style="{backgroundImage: `url(${imagePath}/icons/inducks.png)`}"
            />
            {{ l10n.COLLECTION_INDUCKS }}
          </NavigationItem>
          <NavigationItem path="/print">
            <b-icon-printer-fill />
            {{ l10n.IMPRIMER_COLLECTION }}
          </NavigationItem>
          <NavigationItem path="/logout">
            <b-icon-x-square-fill />
            {{ l10n.DECONNEXION }}
          </NavigationItem>
        </template>
        <template v-else>
          <NavigationItem
            path="/signup"
            icon="glyphicon glyphicon-certificate"
          >
            {{ l10n.NOUVELLE_COLLECTION }}
          </NavigationItem>
          <NavigationItem
            path="/login"
            icon="glyphicon glyphicon-folder-open"
          >
            {{ l10n.OUVRIR_COLLECTION }}
          </NavigationItem>
        </template>
      </template>
    </NavigationItemGroup>
    <li class="empty" />
    <NavigationItem path="/bookstores">
      {{ l10n.RECHERCHER_BOUQUINERIES }}
    </NavigationItem>
    <NavigationItem
      v-if="!username"
      path="/inducks/import"
    >
      {{ l10n.COLLECTION_INDUCKS_POSSEDEE }}
    </NavigationItem>
    <NavigationItem
      v-if="!username"
      path="demo"
    >
      {{ l10n.DEMO_MENU }}
    </NavigationItem>
  </ul>
</template>

<script>
import NavigationItemGroup from "../components/NavigationItemGroup";
import NavigationItem from "../components/NavigationItem";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Navigation",

  components: {
    NavigationItemGroup,
    NavigationItem
  },

  mixins: [l10nMixin],

  computed: {
    username: () => window.username,
    imagePath: () => window.imagePath,
  },
}
</script>

<style lang="scss" scoped>
#menu-content {
  height: 0
}

</style>