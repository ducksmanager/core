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
          <NavigationItem path="agrandir">
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
          <NavigationItem path="print">
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
            path="new"
            icon="glyphicon glyphicon-certificate"
          >
            {{ l10n.NOUVELLE_COLLECTION }}
          </NavigationItem>
          <NavigationItem
            path="open"
            icon="glyphicon glyphicon-folder-open"
          >
            {{ l10n.OUVRIR_COLLECTION }}
          </NavigationItem>
        </template>
      </template>
    </NavigationItemGroup>
    <li class="empty" />
    <NavigationItem path="bouquineries">
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

<style lang="scss">
#menu-content {
  height: 0
}

ul, li {
  list-style: none;
  padding: 0;
  margin: 0;
  line-height: 25px;
  cursor: pointer;
}

ul .active, li .active {
  border-left: 3px solid rgb(200, 137, 100);
  background-color: #4f5b69;
}

ul .sub-menu li.active, li .sub-menu li.active, ul .sub-menu li.active a, li .sub-menu li.active a {
  color: rgb(200, 137, 100);
}

ul .sub-menu li, li .sub-menu li {
  background-color: #181c20;
  border: none;
  line-height: 28px;
  border-bottom: 1px solid #23282e;
  padding-left: 10px;
  margin-left: 0;
}

ul .sub-menu li:hover {
  background-color: #020203;
}

li {
  padding-left: 3px;

  .sub-menu li:hover {
    background-color: #020203;
  }

  &.empty {
    height: 10px;
  }

  a {
    display: block;
    text-decoration: none !important;
    color: inherit !important;
    border-bottom: 0;

    i {
      padding-left: 10px;
      width: 15px;
      padding-right: 5px;
    }
  }

  &.no-icon a i {
    padding-left: 5px;
  }

  &.non-empty:hover {
    border-left: 3px solid rgb(200, 137, 100);
    background-color: #4f5b69;
    -webkit-transition: all 0.1s ease;
    -moz-transition: all 0.1s ease;
    -o-transition: all 0.1s ease;
    -ms-transition: all 0.1s ease;
    transition: all 0.1s ease;
  }

  &.empty {
    cursor: default;
  }
}

.b-custom {
  display: inline-block;
  background-repeat: no-repeat;
  height: 12px;
  background-size: 12px;
  width: 12px;
  background-position: bottom;
}

@media (max-width: 767px) {
  li.empty {
    display: none;
  }
}
</style>