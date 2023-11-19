<template>
  <b-container v-if="gameIsFinished" fluid>
    <b-alert show align="center" variant="info">
      {{ t("This game is finished.") }}
    </b-alert>
    <game-scores :game="game!" />
  </b-container>
  <b-container
    v-else-if="currentRoundNumber"
    fluid
    class="d-flex flex-grow-1 p-0"
  >
    <game-component
      v-if="game"
      :available-time="availableTime"
      :has-everybody-guessed="hasEverybodyGuessed"
      :chosen-author="chosenAuthor"
      :current-round="currentRound!"
      :authors="game.authors"
      :players="players"
      :previous-personcodes="game.rounds.map((round) => round?.personcode!)"
      :remaining-time="remainingTime"
      @select-author="
        chosenAuthor = $event;
        validateGuess();
      "
    />
    <round-result-modal
      v-if="currentRound && currentRoundPlayerScore !== undefined"
      :status="scoreToVariant(currentRoundPlayerScore)"
      :speed-bonus="currentRoundPlayerScore.speedBonus"
      :correct-author="getAuthor(currentRound.personcode!)"
      :round-url="currentRound.sitecodeUrl!"
      :round-number="currentRoundNumber"
      :next-round-start-date="nextRoundStartDate"
      :has-everybody-guessed="hasEverybodyGuessed"
    />
  </b-container>
  <game-starting-soon-modal
    v-else-if="game && firstRoundStartDate"
    :authors="game.authors"
    :first-round-start-date="firstRoundStartDate"
  />
  <matchmaking
    v-else-if="isConnectedToSocket"
    :game-id="gameId"
    :game-socket="gameSocket"
    @start-match="loadGame()"
  />
</template>

<script lang="ts" setup>
import { io } from "socket.io-client";
import { useCookies } from "@vueuse/integrations/useCookies";
import { getDuckguessrId } from "~/composables/user";
import { useScoreToVariant } from "~/composables/use-score-to-variant";
import { GameFullNoPersoncode } from "~types/game";

const duckguessrId = getDuckguessrId();
const { t } = useI18n();
const route = useRoute();

const gameId = parseInt(route.params.id as string);

const isConnectedToSocket = ref(false as boolean);

const chosenAuthor = ref(null as string | null);
const hasEverybodyGuessed = ref(false as boolean);
const gameIsFinished = ref(false as boolean);
const firstRoundStartDate = ref(null as Date | null);

const game = ref(null as GameFullNoPersoncode | null);

const gameSocket = io(`${import.meta.env.SOCKET_URL}/game/${gameId}`, {
  auth: {
    cookie: useCookies().getAll(),
  },
})
  .on("connect", () => {
    isConnectedToSocket.value = true;
  })
  .on("firstRoundWillStartSoon", (receivedFirstRoundStartDate) => {
    firstRoundStartDate.value = receivedFirstRoundStartDate;
  })
  .on("roundStarts", (round) => {
    hasEverybodyGuessed.value = false;
    currentRoundNumber.value = round!.roundNumber;
    game.value!.rounds[currentRoundNumber.value! - 1] = round;
    hasUrlLoaded.value = false;
  })
  .on("roundEnds", (round, nextRound) => {
    hasEverybodyGuessed.value = true;
    chosenAuthor.value = null;
    game.value!.rounds[currentRoundNumber.value! - 1] = round;
    if (nextRound) {
      game.value!.rounds[currentRoundNumber.value!] = nextRound;
    }
  })
  .on("gameEnds", () => {
    gameIsFinished.value = true;
  })
  .on("playerGuessed", ({ roundScore, answer }) => {
    if (roundScore.playerId === duckguessrId) {
      game.value!.rounds[currentRoundNumber.value! - 1]!.personcode = answer;
    }
    game.value!.rounds[currentRoundNumber.value! - 1]!.roundScores.push(
      roundScore
    );
  });

const currentRoundNumber = ref(null as number | null);

const scoreToVariant = useScoreToVariant;

const players = computed(
  () => game.value?.gamePlayers?.map(({ player }) => player) || []
);

const hasUrlLoaded = ref(false as boolean);

const now = ref(Date.now() as number);

const getRound = (searchedRoundNumber: number | null) =>
  searchedRoundNumber == null
    ? null
    : (game.value?.rounds || []).find(
        (round) => round?.roundNumber === searchedRoundNumber
      ) || null;

const currentRound = computed(() => getRound(currentRoundNumber.value));

const availableTime = computed(() =>
  !currentRound.value
    ? Infinity
    : (new Date(currentRound.value!.finishedAt!).getTime() -
        new Date(currentRound.value!.startedAt!).getTime()) /
      1000
);

const remainingTime = computed(() =>
  !currentRound.value
    ? Infinity
    : Math.floor(
        Math.max(
          0,
          (new Date(currentRound.value!.finishedAt!).getTime() - now.value) /
            1000
        )
      )
);

const nextRoundStartDate = computed(() => {
  const nextRound =
    currentRoundNumber.value == null
      ? null
      : game.value?.rounds.find(
          (round) => round?.roundNumber === currentRoundNumber.value! + 1
        ) || null;
  return nextRound?.startedAt ? new Date(nextRound?.startedAt) : null;
});

const validateGuess = async () => {
  const hasEverybodyGuessedResult = await gameSocket.emitWithAck(
    "guess",
    chosenAuthor.value
  );
  hasEverybodyGuessed.value =
    hasEverybodyGuessedResult || hasEverybodyGuessed.value;
};

const loadGame = async () => {
  game.value = await io(import.meta.env.SOCKET_URL).emitWithAck("getPodium");
  if (game.value) {
    const now = new Date().toISOString();
    gameIsFinished.value = game.value.rounds.every(
      (round) => round?.finishedAt && round?.finishedAt.toString() < now
    );
  } else {
    console.error("No game for this ID");
  }
};

const currentRoundScores = computed(() =>
  !currentRound.value ? null : currentRound.value.roundScores
);

const currentRoundPlayerScore = computed(() =>
  (currentRoundScores.value || []).find(
    ({ playerId }) => duckguessrId === playerId
  )
);

const getAuthor = (personcode2: string) =>
  game.value!.authors.find(({ personcode }) => personcode2 === personcode)!;

onMounted(async () => {
  await loadGame();
  if (game.value && gameIsFinished.value) {
    return;
  }
  setInterval(() => {
    now.value = Date.now();
  }, 1000);
});
</script>

<style lang="scss" scoped>
.alert {
  > *:nth-child(1) {
    width: 33%;
  }
  > *:nth-child(2) {
    width: 67%;
  }
}
</style>
