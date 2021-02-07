<template>
  <div :class="{event: true, [`event_${event.type}`]: true}">
    <UserPopover
      v-if="event.userId && stats[event.userId]"
      :id="event.userId"
      :stats="stats[event.userId]"
      :points="points[event.userId]"
    />
    <template v-if="event.type === 'signup'">
      {{ $t("a commencé sa collection sur DucksManager. Bienvenue !") }}
    </template>
    <template v-if="event.type === 'medal'">
      <span
        v-html="$t('a obtenu la médaille <b>{0} niveau {1}</b>', [getMedalTitle(event.contribution), event.niveau])"
      />
    </template>
    <template v-if="event.type === 'bookstore'">
      {{ $t("a ajouté la bouquinerie") }}
      <i><a :href="$r('/bookstores')">{{ event.nom_bouquinerie }}</a></i>
    </template>
    <template v-if="event.type === 'collection_update'">
      {{ $t("a ajouté") }}
      <Issue
        v-if="publicationNames[event.publicationCode]"
        :publicationname="publicationNames[event.publicationCode]"
        :publicationcode="event.publicationCode"
        :issuenumber="event.issueNumber"
        hide-condition
      />
      <OtherIssues :number="event.numberOfIssues" />
      {{ $t("à sa collection") }}
    </template>
    <template v-if="event.type === 'edge'">
      <span
        v-for="(collaborator, index) in event.users"
        :key="collaborator"
      >
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ $t("et") }}
          </template>
          <template v-else-if="index > 0">,</template>
        </template>
        <UserPopover
          :id="collaborator"
          :stats="stats[collaborator]"
          :points="points[collaborator]"
        />
      </span>
      <template v-if="event.users.length>1">
        {{ $t("ont créé la tranche") }}
      </template>
      <template v-else>
        {{ $t("a créé la tranche") }}
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
          :text-single="$t('autre tranche')"
          :text-multiple="$t('autres tranches')"
        />
      </span>
      <BookcasePopover
        :id="`event-edges-${event.timestamp}`"
        :edges="event.edges"
      />
      {{ $t("pour la bibliothèque DucksManager") }}
    </template>
    <template v-if="event.type === 'subscription_additions'">
      <span
        v-for="(subscriber, index) in event.users"
        :key="subscriber"
      >
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ $t("et") }}
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
        {{ $t("ont reçu") }}
      </template>
      <template v-else>
        {{ $t("a reçu") }}
      </template>
      <Issue
        v-if="publicationNames[event.publicationCode]"
        :publicationname="publicationNames[event.publicationCode]"
        :publicationcode="event.publicationCode"
        :issuenumber="event.issueNumber"
        hide-condition
      />
      <template v-if="event.users.length>1">
        {{ $t("grâce à leur abonnement à ce magazine") }}
      </template>
      <template v-else>
        {{ $t("grâce à son abonnement à ce magazine") }}
      </template>
    </template>
    <slot />
  </div>
</template>
<script>
import Issue from "../components/Issue";
import OtherIssues from "../components/OtherIssues";
import UserPopover from "../components/UserPopover";
import { mapState } from "vuex";
import l10nMixin from "../mixins/l10nMixin";
import BookcasePopover from "./BookcasePopover";

export default {
  name: "Event",
  components: { BookcasePopover, Issue, OtherIssues, UserPopover },
  mixins: [l10nMixin],
  props: {
    event: { type: Object, required: true }
  },

  computed: {
    ...mapState("coa", ["publicationNames"]),
    ...mapState("users", ["stats", "points"])
  },

  methods: {
    getMedalTitle(contribution) {
      switch (contribution.toUpperCase()) {
        case "CREATEUR":
          return "Concepteur de tranches";
        case "PHOTOGRAPHE":
          return "Photographe de tranches";
        case "DUCKHUNTER":
          return "Concepteur de tranches";
      }
    }
  }
};
</script>
<style scoped lang="scss">
.event {
  margin-top: 12px;
}
</style>
