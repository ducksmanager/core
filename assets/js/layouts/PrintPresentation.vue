<template>
  <div v-if="l10n">
    {{ l10n.IMPRESSION_COLLECTION_PRESENTATION_LISTES }}
    <ul>
      <li
        v-for="type in types"
        :key="type.link"
        class="print-type"
        :style="{backgroundImage: `url(${imagePath}/lists/${type.link}.png)`}"
      >
        <span
          v-if="type.exclusive"
          class="exclusive"
        >{{ l10n.EXCLUSIF_DUCKSMANAGER }}</span>
        <span v-html="l10n[type.description]" />
        <ul class="details">
          <li
            v-for="detail in type.details"
            :key="detail"
            class="detail"
          >
            {{ l10n[detail] }}
          </li>
          <li v-if="type.link === 'collectable'">
            <a
              href="http://www.youtube.com/watch?v=PAg-g1cF148&hd=1"
              target="_blank"
            >{{ l10n.CLIQUEZ_ICI }}</a>
            {{ l10n.COLLECTABLE_DEMO }}
          </li>
        </ul>
        <a
          :href="`/print/${type.link}`"
          target="_blank"
        >{{ l10n.IMPRESSION_COLLECTION_AVEC }} {{ l10n[type.name] }}</a>
        <br>
      </li>
    </ul>
  </div>
</template>

<script>
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "PrintPresentation",
  mixins: [l10nMixin],
  data: () => ({
    types: [{
      link: 'classic',
      name: 'CLASSIQUE_NOM',
      description: 'CLASSIQUE_DESCRIPTION',
      details: [
        'CLASSIQUE_PLUS_1',
        'CLASSIQUE_MOINS_1'
      ]
    }, {
      link: 'collectable',
      name: 'COLLECTABLE_NOM',
      exclusive: true,
      description: 'COLLECTABLE_DESCRIPTION',
      details: [
        'COLLECTABLE_PLUS_1'
      ]
    }]
  }),
  computed: {
    imagePath: () => window.imagePath
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin-top: 30px;

  &.details {
    li {
      margin-top: 14px;
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
      border: 1px solid #C88964;
      padding: 3px;
      margin-right: 5px;
      color: #C88964;
      white-space: nowrap;
    }
  }
}
</style>