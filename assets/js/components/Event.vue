<template>
  <div :class="{ event: true, [`event_${event.type}`]: true }">
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
      {{ $t('a obtenu la médaille <b>{0} niveau {1}</b>',
      [getMedalTitle(event.contribution), event.niveau]) }}
    </template>
    <template v-if="event.type === 'bookstore_comment'">
      {{ $t("a visité la bouquinerie") }}
      <i
        ><a :href="r('/bookstores')">{{ event.name }}</a></i
      >
    </template>
    <template v-if="event.type === 'collection_update'"
      >&nbsp;{{ $t("a ajouté") }}
      <Issue
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
      <span v-for="(collaborator, index) in event.users" :key="collaborator">
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ $t("et") }}
          </template>
          <template v-else-if="index > 0">,</template>
        </template>
        <UserPopover
          v-if="stats[event.userId]"
          :id="collaborator"
          :stats="stats[collaborator]"
          :points="points[collaborator]"
        />
      </span>
      <template v-if="event.users.length > 1"
        >&nbsp;{{ $t("ont créé la tranche") }}
      </template>
      <template v-else>&nbsp;{{ $t("a créé la tranche") }} </template
      >&nbsp;<span
        :id="`event-edges-${event.timestamp}`"
        class="fw-bold"
        style="cursor: help"
      >
        <Issue
          v-if="publicationNames[event.edges[0].publicationCode]"
          :publicationname="publicationNames[event.edges[0].publicationCode]"
          :publicationcode="event.edges[0].publicationCode"
          :issuenumber="event.edges[0].issueNumber"
          hide-condition
          :flex="false"
        />&nbsp;<OtherIssues
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
      <span v-for="(subscriber, index) in event.users" :key="subscriber">
        <template v-if="event.users.length > 1">
          <template v-if="index === event.users.length - 1">
            {{ ` ${$t("et")} ` }}
          </template>
          <template v-else-if="index > 0"> , </template>
        </template>
        <UserPopover
          v-if="stats[event.userId]"
          :id="subscriber"
          :stats="stats[subscriber]"
          :points="points[subscriber]"
        />
      </span>
      <template v-if="event.users.length > 1">
        {{ ` ${$t("ont reçu")} ` }}
      </template>
      <template v-else>
        {{ ` ${$t("a reçu")} ` }}
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

import Issue from "../components/Issue";
import OtherIssues from "../components/OtherIssues";
import UserPopover from "../components/UserPopover";
import { coa } from "../stores/coa";
import { l10n } from "../stores/l10n";
import { users } from "../stores/users";
import BookcasePopover from "./BookcasePopover";

defineProps({
  event: { type: Object, required: true },
});

const publicationNames = $computed(() => coa().publicationNames),
  stats = $computed(() => users().stats),
  points = $computed(() => users().points),
  { r } = l10n(),
  { t: $t } = useI18n(),
  getMedalTitle = (contribution) => {
    switch (contribution.toUpperCase()) {
      case "CREATEUR":
        return $t("Concepteur de tranches");
      case "PHOTOGRAPHE":
        return $t("Photographe de tranches");
      case "DUCKHUNTER":
        return $t("Duckhunter");
    }
  };
</script>
<style scoped lang="scss">
.event {
  margin-top: 12px;
}
</style>
