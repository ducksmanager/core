<template>
  <ul
    v-if="l10n"
    id="menu-content"
    class="menu-content collapse show"
  >
    <MenuItemGroup
      path="collection"
      icon="glyphicon-home"
    >
      <template #text>
        {{ l10n.COLLECTION }}
      </template>
      <template #items>
        <template v-if="username">
          <MenuItem
            path="bibliotheque"
            icon="glyphicon glyphicon-book"
          >
            {{ l10n.BIBLIOTHEQUE_COURT }}
          </MenuItem>
          <MenuItem
            path="gerer"
            icon="glyphicon glyphicon-list-alt"
          >
            {{ l10n.GERER_COLLECTION }}
          </MenuItem>
          <MenuItem
            path="stats"
            icon="glyphicon glyphicon-tasks"
          >
            {{ l10n.STATISTIQUES_COLLECTION }}
          </MenuItem>
          <MenuItem
            path="agrandir"
            icon="glyphicon glyphicon-fire"
          >
            {{ l10n.AGRANDIR_COLLECTION }}
          </MenuItem>
          <MenuItem
            path="importer_inducks"
            icon="glyphicon custom-inducks"
          >
            {{ l10n.COLLECTION_INDUCKS }}
          </MenuItem>
          <MenuItem
            path="print"
            icon="glyphicon glyphicon-print"
          >
            {{ l10n.IMPRIMER_COLLECTION }}
          </MenuItem>
          <MenuItem
            path="logout"
            icon="glyphicon glyphicon-log-out"
          >
            {{ l10n.DECONNEXION }}
          </MenuItem>
        </template>
        <template v-else>
          <MenuItem
            path="new"
            icon="glyphicon glyphicon-certificate"
          >
            {{ l10n.NOUVELLE_COLLECTION }}
          </MenuItem>
          <MenuItem
            path="open"
            icon="glyphicon glyphicon-folder-open"
          >
            {{ l10n.OUVRIR_COLLECTION }}
          </MenuItem>
        </template>
      </template>
    </MenuItemGroup>
    <li class="empty" />
    <MenuItem path="bouquineries">
      {{ l10n.RECHERCHER_BOUQUINERIES }}
    </MenuItem>
    <MenuItem
      v-if="!username"
      path="inducks"
    >
      {{ l10n.COLLECTION_INDUCKS_POSSEDEE }}
    </MenuItem>
    <MenuItem
      v-if="!username"
      path="demo"
    >
      {{ l10n.DEMO_MENU }}>
    </MenuItem>
  </ul>
</template>

<script>
import MenuItemGroup from "../components/MenuItemGroup";
import MenuItem from "../components/MenuItem";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Navigation",

  components: {
    MenuItemGroup,
    MenuItem
  },

  mixins: [l10nMixin],

  computed: {
    username: () => window.username
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
    text-decoration: none;
    color: #e1ffff;
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

@media (max-width: 767px) {
  li.empty {
    display: none;
  }
}
</style>