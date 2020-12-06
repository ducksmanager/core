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
      <i><a :href="$r('/bookstores')">{{ event.nom_bouquinerie }}</a></i>
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
      <OtherIssues :number="event.numberOfIssues" />
      {{ l10n.NEWS_A_SA_COLLECTION }}
    </template>
    <template v-if="event.type === 'edge'">
      <span
        v-for="(collaborator, index) in event.users"
        :key="collaborator"
      >
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
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
      <template v-if="event.users.length>1">
        {{ l10n.NEWS_ONT_CREE_TRANCHE }}
      </template>
      <template v-else>
        {{ l10n.NEWS_A_CREE_TRANCHE }}
      </template>
      <span
        :id="`event-edges-${event.timestamp}`"
        class="font-weight-bold"
        style="cursor: help"
      >
        <Issue
          v-if="publicationNames[event.edges[0].publicationCode]"
          :publicationname="publicationNames[event.edges[0].publicationCode]"
          :publicationcode="event.edges[0].publicationCode"
          :issuenumber="event.edges[0].issueNumber"
          hide-condition
        />
        <OtherIssues
          :number="event.edges.length"
          l10-key-single="NEWS_AUTRE_TRANCHE"
          l10-key-multiple="NEWS_AUTRES_TRANCHES"
        />
      </span>
      <BookcasePopover
        :id="`event-edges-${event.timestamp}`"
        :edges="event.edges"
      />
      {{ l10n.NEWS_ONT_CREE_TRANCHE_2 }}
    </template>
    <template v-if="event.type === 'subscription_additions'">
      <span
        v-for="(subscriber, index) in event.users"
        :key="subscriber"
      >
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ l10n.ET }}
          </template>
          <template v-else-if="index > 0">
            ,
          </template>
        </template>
        <UserPopover
          :id="subscriber"
          :stats="stats[subscriber]"
          :points="points[subscriber]"
        />
      </span>
      <template v-if="event.users.length>1">
        {{ l10n.NEWS_ONT_RECU_NUMERO_ABONNEMENT }}
      </template>
      <template v-else>
        {{ l10n.NEWS_A_RECU_NUMERO_ABONNEMENT }}
      </template>
      <Issue
        v-if="publicationNames[event.publicationCode]"
        :publicationname="publicationNames[event.publicationCode]"
        :publicationcode="event.publicationCode"
        :issuenumber="event.issueNumber"
        hide-condition
      />
      {{ l10n.NEWS_ONT_RECU_NUMERO_ABONNEMENT_2 }}
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
import BookcasePopover from "./BookcasePopover";

export default {
  name: 'Event',
  components: {BookcasePopover, Issue, OtherIssues, UserPopover},
  mixins: [l10nMixin],
  props: {
    event: {type: Object, required: true}
  },

  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("users", ["stats", "points"]),
  }
}
</script>
<style scoped lang="scss">
.event {
  margin-top: 12px;
}
</style>