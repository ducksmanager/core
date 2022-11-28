<template>
  <div class="event" :class="{ [`event_${event.type}`]: true }">
    <UserPopover
      v-if="event.userId && stats[event.userId]"
      :id="`event-${event.timestamp}-user-${event.userId}`"
      :stats="stats[event.userId]"
      :points="points[event.userId]"
    /><span v-else-if="event.userId === null" class="text-capitalize">
      {{ $t("un visiteur anonyme") }} </span
    ><template v-if="event.type === 'signup'">
      &nbsp;{{
        $t("a commencé sa collection sur DucksManager. Bienvenue !")
      }} </template
    ><span
      v-if="event.type === 'medal'"
      v-html="
        `&nbsp;${$t('a obtenu la médaille <b>{0} niveau {1}</b>', [
          getMedalTitle(event.contribution),
          event.niveau,
        ])}`
      "
    /><template v-if="event.type === 'bookstore_comment'">
      &nbsp;{{ $t("a visité la bouquinerie") }}
      <i
        ><router-link to="/bookstores">{{ event.name }}</router-link></i
      >
    </template>
    <template v-if="event.type === 'collection_update'">
      &nbsp;{{ $t("a ajouté")
      }}<Issue
        v-if="publicationNames[event.publicationCode]"
        :publicationname="publicationNames[event.publicationCode]"
        :publicationcode="event.publicationCode"
        :issuenumber="event.issueNumber"
        hide-condition
        :flex="false"
      />
      <OtherIssues :number="event.numberOfIssues" />
      {{ $t("à sa collection") }}
    </template>
    <template v-if="event.type === 'edge'">
      <span v-for="(userId, index) in event.users" :key="userId">
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ ` ${$t("et")} ` }}
          </template>
          <template v-else-if="index > 0">,</template>
        </template>
        <UserPopover
          v-if="stats[userId]"
          :id="`event-${event.timestamp}-user-${userId}`"
          :stats="stats[userId]"
          :points="points[userId]"
        />
      </span>
      <template v-if="event.users.length > 1">
        &nbsp;{{ $t("ont créé la tranche") }}
      </template>
      <template v-else> &nbsp;{{ $t("a créé la tranche") }} </template>
      <BookcasePopover
        :id="`event-edges-${event.timestamp}`"
        :edges="event.edges"
      >
        <span class="fw-bold" style="cursor: help">
          <Issue
            v-if="publicationNames[event.edges[0].publicationCode]"
            :publicationname="publicationNames[event.edges[0].publicationCode]"
            :publicationcode="event.edges[0].publicationCode"
            :issuenumber="event.edges[0].issueNumber"
            hide-condition
            :flex="true"
          />&nbsp;<OtherIssues
            :number="event.edges.length"
            :text-single="$t('autre tranche')"
            :text-multiple="$t('autres tranches')"
          />&nbsp;</span
        > </BookcasePopover
      >{{ $t("pour la bibliothèque DucksManager") }}
    </template>
    <template v-if="event.type === 'subscription_additions'">
      <span v-for="(userId, index) in event.users" :key="userId">
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ ` ${$t("et")} ` }}
          </template>
          <template v-else-if="index > 0">, </template>
        </template>
        <UserPopover
          v-if="stats[userId]"
          :id="`event-${event.timestamp}-user-${userId}`"
          :stats="stats[userId]"
          :points="points[userId]"
        />
      </span>
      <template v-if="event.users.length > 1">
        {{ ` ${$t("ont reçu")}` }}
      </template>
      <template v-else>
        {{ ` ${$t("a reçu")}` }}
      </template>
      <Issue
        v-if="publicationNames[event.publicationCode]"
        :publicationname="publicationNames[event.publicationCode]"
        :publicationcode="event.publicationCode"
        :issuenumber="event.issueNumber"
        hide-condition
        :flex="false"
      />
      <template v-if="event.users.length > 1">
        {{ $t("grâce à leur abonnement à ce magazine") }}
      </template>
      <template v-else>
        {{ $t("grâce à son abonnement à ce magazine") }}
      </template>
    </template>
    <slot />
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

import { coa } from "~/stores/coa";
import { users } from "~/stores/users";

defineProps({
  event: { type: Object, required: true },
});

const publicationNames = $computed(() => coa().publicationNames);
const stats = $computed(() => users().stats);
const points = $computed(() => users().points);
const { t: $t } = useI18n();
const getMedalTitle = (contribution) => {
  switch (contribution) {
    case "edge_photographer":
      return $t("Photographe de tranches");
    case "edge_designer":
      return $t("Concepteur de tranches");
    case "duckhunter":
      return $t("Duckhunter");
  }
};
</script>

<style scoped lang="scss">
.event {
  margin-top: 12px;

  &.event_edge > :nth-child(3) {
    display: inline;

    :deep(> div) {
      display: inline;
    }
  }
}
</style>
