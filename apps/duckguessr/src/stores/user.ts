import { defineStore } from "pinia";
import { useCookies } from "@vueuse/integrations/useCookies";
import {
  removeCookie,
  setDuckguessrUserData,
  setUserCookieIfNotExists,
} from "~/composables/user";
import {
  type ClientEmitEvents as PlayerEmitEvents,
  // type ClientListenEvents as PlayerListenEvents,
} from "~duckguessr-services/player";

import { socketInjectionKey as dmSocketInjectionKey } from "~web/src/composables/useDmSocket";
import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";
import { MedalLevel } from "~duckguessr-types/playerStats";
import {
  player,
  userGameMedalPoints,
  userMedalPoints,
} from "~duckguessr-prisma-client";

export const MEDAL_LEVELS: MedalLevel[] = [
  { medalType: "fast", levels: [25, 150, 500] },
  { medalType: "ultra_fast", levels: [10, 50, 200] },
  { medalType: "published-fr-recent", levels: [10, 75, 300] },
  { medalType: "it", levels: [10, 75, 300] },
  { medalType: "us", levels: [10, 75, 300] },
];

export const userStore = defineStore("user", () => {
  const user = ref<player | null>(null);
  let playerSocket:
    | ReturnType<typeof useDuckguessrSocket>["playerSocket"]
    | null = null;
  const stats = ref<userMedalPoints[] | null>(null);
  const gameStats = ref<userGameMedalPoints[] | null>(null);
  const attempts = ref(0);

  const isAnonymous = computed(
    () => user.value && /^user\d+$/.test(user.value.username),
  );
  const login = () => {
    playerSocket = inject(duckguessrSocketInjectionKey)!
      .playerSocket // TODO create socket from auth
      // cookie: useCookies().getAll(),
      .on("logged", (loggedInUser: player) => {
        user.value = loggedInUser;
        console.log(`logged as ${user.value.username}`);
        setDuckguessrUserData(loggedInUser);
      })
      .on("loginFailed", () => {
        console.log("loginFailed");
        removeCookie("duckguessr-user");
        if (attempts.value < 1) {
          attempts.value++;
          setUserCookieIfNotExists();
          login();
        }
      });
  };
  const loadStats = () => {
    playerSocket!.getStats(null, (newStats) => {
      stats.value = newStats;
    });
  };
  const loadGameStats = (
    gameId: number,
    currentGameDatasetName: string | null,
    isWinningPlayer: boolean,
  ) => {
    playerSocket!.getGameStats(gameId, (stats) => {
      gameStats.value = stats;
      if (currentGameDatasetName) {
        gameStats.value!.push({
          medalType: currentGameDatasetName,
          gameId,
          playerId: user.value!.id,
          playerPoints: isWinningPlayer ? 1 : 0,
        });
      }
    });
  };

  return {
    user,
    stats,
    login,
    playerSocket,
    isAnonymous,
    gameStats,
    loadStats,
    loadGameStats,
  };
});
