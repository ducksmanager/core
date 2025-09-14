import { defineStore } from "pinia";
import type { EventOutput } from "socket-call-client";
import type { ClientEmitEvents as PlayerEmitEvents } from "~duckguessr-services/player";

import {
  removeCookie,
  setDuckguessrUserData,
  setUserCookieIfNotExists,
} from "~/composables/user";
import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";
import type { player, userMedalPoints } from "~duckguessr-prisma-client";
import type { MedalLevel } from "~duckguessr-types/playerStats";

export const MEDAL_LEVELS: MedalLevel[] = [
  { medalType: "fast", levels: [25, 150, 500] },
  { medalType: "ultra_fast", levels: [10, 50, 200] },
  { medalType: "published-fr-recent", levels: [10, 75, 300] },
  { medalType: "it", levels: [10, 75, 300] },
  { medalType: "us", levels: [10, 75, 300] },
];

export const userStore = defineStore("user", () => {
  const user = ref<player>();
  const playerSocket:
    | ReturnType<typeof useDuckguessrSocket>["playerSocket"]
    | null = null;
  const stats = ref<userMedalPoints[]>();
  const gameStats = ref<EventOutput<PlayerEmitEvents, "getGameStats">>();
  const attempts = ref(0);

  const isAnonymous = computed(
    () => user.value && /^user\d+$/.test(user.value.username),
  );
  const login = () => {
    // cookie: useCookies().getAll(),
    const { playerSocket } = inject(duckguessrSocketInjectionKey)!;
    playerSocket.logged = // TODO create socket from auth
      (loggedInUser: player) => {
        user.value = loggedInUser;
        console.log(`logged as ${user.value.username}`);
        setDuckguessrUserData(loggedInUser);
      };
    playerSocket.loginFailed = () => {
      console.log("loginFailed");
      removeCookie("duckguessr-user");
      if (attempts.value < 1) {
        attempts.value++;
        setUserCookieIfNotExists();
        login();
      }
    };
  };
  const loadStats = () => {
    playerSocket!.getStats().then((newStats: userMedalPoints[]) => {
      stats.value = newStats;
    });
  };
  const loadGameStats = (
    gameId: number,
    currentGameDatasetName: string | null,
    isWinningPlayer: boolean,
  ) => {
    playerSocket!
      .getGameStats(gameId)
      .then((stats: EventOutput<PlayerEmitEvents, "getGameStats">) => {
        gameStats.value = stats;
        if (currentGameDatasetName) {
          gameStats.value.stats.push({
            medalType: currentGameDatasetName,
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
