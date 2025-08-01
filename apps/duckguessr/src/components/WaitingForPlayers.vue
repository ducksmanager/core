<template>
  <b-container align="center">
    <alert-not-connected v-if="isAnonymous === true" />
    <h3>{{ t("The game is about to start!") }}</h3>
    <b-row align-h="center">
      <b-card
        v-for="{ username, avatar, id } in players"
        :key="username"
        class="player m-3 col-lg-3"
      >
        <player-info
          :username="username"
          :avatar="avatar"
          :toggleable="isBot(username)"
          @toggle="emit('remove-bot')"
        >
          <medal-list
            :with-details="false"
            :stats-override="getGamePlayerStats(id)"
          />
        </player-info>
      </b-card>
      <b-card
        v-if="isMatchCreator && isBotAvailable && !isBotPlaying"
        class="player m-3 col-lg-3"
      >
        <player-info
          username="potential_bot"
          toggleable
          @toggle="emit('add-bot')"
        />
      </b-card>
    </b-row>
    <b-row align-h="center" class="mt-3">
      <b-col>
        {{
          t(
            "Waiting for other players... Send this link to your friends to invite them to this game:",
          )
        }}
      </b-col>
    </b-row>
    <b-row align-h="center">
      <b-col>
        <b-row class="justify-content-center">
          <b-col cols="12" md="6" class="my-3">
            <input
              type="text"
              class="text-center"
              readonly
              :value="gameUrl"
              @click="($event.target as HTMLInputElement | undefined)?.select()"
            />
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-button
      v-if="isMatchCreator"
      :disabled="players.length < 2"
      variant="success"
      @click="emit('start-match')"
    >
      {{ t("Let's go!") }}
    </b-button>
  </b-container>
</template>

<script lang="ts" setup>
import { useSeoMeta } from "@unhead/vue";
import { getDuckguessrUsername } from "~/composables/user";
import { userStore } from "~/stores/user";
import type { player, userMedalPoints } from "~duckguessr-prisma-client";

const { players, gameId, gamePlayersStats } = defineProps<{
  players: player[];
  gamePlayersStats: userMedalPoints[];
  gameId: number;
  isBotAvailable: boolean;
}>();

const emit = defineEmits<{
  (e: "start-match"): void;
  (e: "add-bot"): void;
  (e: "remove-bot"): void;
}>();

const { t } = useI18n();

// For some reason vue-i18n's interpolation doesn't work
const title = computed(() =>
  t("Join {username}'s Duckguessr game!")
    .toString()
    .replace("{username}", players[0].username),
);
const gameUrl = computed(() => `${location.origin}/game/${gameId}`);
const isMatchCreator = computed(
  () => getDuckguessrUsername() === players[0].username,
);
const isBotPlaying = computed(() =>
  players.find(({ username }) => isBot(username)),
);

const isBot = (username: string) => /^bot_/.test(username);

const isAnonymous = computed(() => userStore().isAnonymous);

const getGamePlayerStats = (playerId: number) =>
  gamePlayersStats.filter(
    ({ playerId: statsPlayerId }) => playerId === statsPlayerId,
  );

useSeoMeta({
  title,
  ogTitle: title,
  ogDescription: title,
  ogUrl: gameUrl,
  ogImage: `${location.origin}/favicon.png`,
  ogSiteName: "Duckguessr",
});
</script>

<style scoped lang="scss">
.card {
  color: black;

  &.player {
    .card {
      max-width: calc(50% - 30px);
    }
  }
}

input {
  color: gray;
  width: 100%;
}
</style>
