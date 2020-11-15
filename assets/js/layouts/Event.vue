<template>
  <div :class="{event: true, [`event_${event.type}`]: true}">
    <UserPopover
      v-if="event.userId && stats[event.userId]"
      :id="event.userId"
      :stats="stats[event.userId]"
      :points="points[event.userId]"
    />
    <template v-if="event.type === 'signup'">
      {{ l10n.NEWS_A_COMMENCE_COLLECTION }}
    </template>
    <template v-if="event.type === 'medal'">
      <span
        v-html="$t('NEWS_A_OBTENU_MEDAILLE', [$t(`TITRE_MEDAILLE_${event.contribution.toUpperCase()}`), event.niveau])"
      />
    </template>
    <template v-if="event.type === 'bookstore'">
      {{ l10n.NEWS_A_AJOUTE_BOUQUINERIE }}
      <i><a href="/bookstores">{{ event.nom_bouquinerie }}</a></i>
    </template>
    <template v-if="event.type === 'collection_update'">
      {{ l10n.NEWS_A_AJOUTE }}
      <Issue
        v-if="publicationNames[event.publicationcode]"
        :publicationname="publicationNames[event.publicationcode]"
        :publicationcode="event.publicationcode"
        :issuenumber="event.issuenumber"
        hide-condition
      />
      <OtherIssues :number="event.cpt" />
      {{ l10n.NEWS_A_SA_COLLECTION }}
    </template>
    <template v-if="event.type === 'edge'">
      <span
        v-for="(collaborator, index) in event.collaborators"
        :key="collaborator"
      >
        <template v-if="event.collaborators.length > 1">
          <template v-if="index === event.collaborators.length - 1">
            {{ l10n.ET }}
          </template>
          <template v-else-if="index > 0">
            ,
          </template>
        </template>
        <UserPopover
          :id="collaborator"
          :stats="stats[collaborator]"
          :points="points[collaborator]"
        />
      </span>
      <template v-if="event.collaborators.length>1">
        {{ l10n.NEWS_ONT_CREE_TRANCHE }}
      </template>
      <template v-else>
        {{ l10n.NEWS_A_CREE_TRANCHE }}
      </template>
      <Issue
        v-if="publicationNames[event.publicationcode]"
        :publicationname="publicationNames[event.publicationcode]"
        :publicationcode="event.publicationcode"
        :issuenumber="event.issuenumber"
        hide-condition
      />
      <OtherIssues :number="event.cpt" />
      {{ l10n.NEWS_ONT_CREE_TRANCHE_2 }}
    </template>
    <slot />
  </div>
</template>
<script>
import Issue from "../components/Issue"
import OtherIssues from "../components/OtherIssues"
import UserPopover from "../components/UserPopover"
import {mapState} from "vuex";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: 'Event',
  components: {Issue, OtherIssues, UserPopover},
  mixins: [l10nMixin],
  props: {
    event: {type: Object, required: true}
  },

  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("users", ["stats", "points"]),
  },
}
</script>
<style scoped lang="scss">
.event {
  margin-top: 12px;
}
</style>