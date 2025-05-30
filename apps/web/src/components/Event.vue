<template>
  <div class="event" :class="{ [`event_${event.type}`]: true }">
    <span v-for="(userId, index) in event.users" :key="userId || 0">
      <template v-if="event.users.length > 1">
        <template v-if="index === event.users.length - 1">
          {{ ` ${$t("et")} ` }}
        </template>
        <template v-else-if="index > 0">, </template>
      </template>
      <span v-if="userId === null" class="text-capitalize">
        {{ $t("un visiteur anonyme") }}
      </span>
      <UserPopover
        v-else-if="stats[userId]"
        :id="`event-${event.timestamp}-user-${userId}`"
        :stats="stats[userId]"
        :points="points[userId]"
      />
      <b v-else>{{ userId }}</b> </span
    ><template v-if="signupEvent"
      >&nbsp;{{
        $t("a commencé sa collection sur DucksManager. Bienvenue !")
      }} </template
    ><template v-else-if="medalEvent"
      >&nbsp;<i18n-t
        tag="span"
        keypath="a obtenu la médaille {medal_and_level}"
      >
        <template #medal_and_level
          ><b>
            {{
              $t("{medal} niveau {level}", {
                medal: getMedalTitle(medalEvent.contribution),
                level: medalEvent.level,
              })
            }}</b
          >
        </template>
      </i18n-t>
    </template>
    <template v-else-if="bookstoreCommentEvent"
      >&nbsp;{{ $t("a visité la bouquinerie") }}
      <i
        ><router-link to="/bookstores">{{
          bookstoreCommentEvent.name
        }}</router-link></i
      >
    </template>
    <template v-else-if="collectionUpdateEvent"
      >&nbsp;{{ $t("a ajouté") }}&nbsp;<Issue
        :issuecode="collectionUpdateEvent.exampleIssuecode"
        hide-condition
        :flex="false"
      />
      <OtherIssues :number="collectionUpdateEvent.numberOfIssues" />
      {{ $t("à sa collection") }}
    </template>
    <template v-else-if="edgeEvent">
      <template v-if="event.users.length > 1"
        >&nbsp;{{ $t("ont créé la tranche") }}
      </template>
      <template v-else>&nbsp;{{ $t("a créé la tranche") }} </template>
      &nbsp;<BookcasePopover
        :id="`event-edges-${event.timestamp}`"
        :issuecodes="edgeEvent.issuecodes"
      >
        <span class="fw-bold" style="cursor: help">
          <Issue
            :issuecode="edgeEvent.issuecodes[0]"
            hide-condition
            :flex="false"
          />&nbsp;<OtherIssues
            :number="edgeEvent.issuecodes.length"
            :text-single="$t('autre tranche')"
            :text-multiple="$t('autres tranches')"
          />
        </span>
      </BookcasePopover>
      {{ $t("pour la bibliothèque DucksManager") }}
    </template>
    <template v-else-if="collectionSubscriptionAdditionEvent">
      <template v-if="event.users.length > 1"
        >&nbsp;{{ $t("ont reçu") }}&nbsp;
      </template>
      <template v-else> {{ $t("a reçu") }} </template>
      <Issue
        :issuecode="collectionSubscriptionAdditionEvent.issuecode"
        hide-condition
        :flex="false"
      />
      <template v-if="event.users.length > 1">
        &nbsp;{{ $t("grâce à leur abonnement à ce magazine") }}
      </template>
      <template v-else>
        &nbsp;{{ $t("grâce à son abonnement à ce magazine") }}
      </template>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { BookstoreCommentEvent } from "~dm-types/events/BookstoreCommentEvent";
import type { CollectionSubscriptionAdditionEvent } from "~dm-types/events/CollectionSubscriptionAdditionEvent";
import type { CollectionUpdateEvent } from "~dm-types/events/CollectionUpdateEvent";
import type { EdgeCreationEvent } from "~dm-types/events/EdgeCreationEvent";
import type { MedalEvent } from "~dm-types/events/MedalEvent";
import type { SignupEvent } from "~dm-types/events/SignupEvent";

const { stats, points } = storeToRefs(users());

const { event } = defineProps<{
  event:
    | BookstoreCommentEvent
    | CollectionUpdateEvent
    | CollectionSubscriptionAdditionEvent
    | EdgeCreationEvent
    | MedalEvent
    | SignupEvent;
}>();

const signupEvent = $computed(() =>
  event.type === "signup" ? (event as SignupEvent) : null,
);

const medalEvent = $computed(() =>
  event.type === "medal" ? (event as MedalEvent) : null,
);

const edgeEvent = $computed((): EdgeCreationEvent | null =>
  event.type === "edge" ? (event as EdgeCreationEvent) : null,
);

const bookstoreCommentEvent = $computed(() =>
  event.type === "bookstore_comment" ? (event as BookstoreCommentEvent) : null,
);

const collectionSubscriptionAdditionEvent = $computed(() =>
  event.type === "subscription_additions"
    ? (event as CollectionSubscriptionAdditionEvent)
    : null,
);

const collectionUpdateEvent = $computed(() =>
  event.type === "collection_update" ? (event as CollectionUpdateEvent) : null,
);

const { t: $t } = useI18n();
const getMedalTitle = (contribution: string) => {
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
