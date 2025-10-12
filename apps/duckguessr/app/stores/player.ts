import { defineStore } from "pinia";
import type { EventOutput } from "socket-call-client";

import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";
import {
  removeCookie,
  setDuckguessrUserData,
  setUserCookieIfNotExists,
} from "~/composables/user";
import type { player, userMedalPoints } from "~duckguessr-prisma-browser";
import type { ClientEmitEvents as PlayerEmitEvents } from "~duckguessr-services/player";
import type { MedalLevel } from "~duckguessr-types/playerStats";

export const MEDAL_LEVELS: MedalLevel[] = [
  { medalType: "fast", levels: [25, 150, 500] },
  { medalType: "ultra_fast", levels: [10, 50, 200] },
  { medalType: "published-fr-recent", levels: [10, 75, 300] },
  { medalType: "it", levels: [10, 75, 300] },
  { medalType: "us", levels: [10, 75, 300] },
];

export const playerStore = defineStore("player", () => {
  const playerUser = ref<player>();
  const stats = ref<userMedalPoints[]>();
  const gameStats = ref<EventOutput<PlayerEmitEvents, "getGameStats">>();
  const attempts = ref(0);

  const isAnonymous = computed(
    () => playerUser.value && /^user\d+$/.test(playerUser.value.username),
  );
  const login = () => {
    // cookie: useCookies().getAll(),
    const { playerSocket } = inject(duckguessrSocketInjectionKey)!;
    playerSocket.logged = // TODO create socket from auth
      (loggedInUser: player) => {
        playerUser.value = loggedInUser;
        console.log(`logged as ${playerUser.value.username}`);
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
    const { playerSocket } = inject(duckguessrSocketInjectionKey)!;
    playerSocket.getStats().then((newStats) => {
      stats.value = newStats;
    });
  };
  const loadGameStats = (
    gameId: number,
    currentGameDatasetName: string | null,
    isWinningPlayer: boolean,
  ) => {
    const { playerSocket } = inject(duckguessrSocketInjectionKey)!;
    playerSocket.getGameStats(gameId).then((stats) => {
      gameStats.value = stats;
      if (currentGameDatasetName) {
        gameStats.value.stats.push({
          medalType: currentGameDatasetName,
          playerId: playerUser.value!.id,
          playerPoints: isWinningPlayer ? 1 : 0,
        });
      }
    });
  };

  return {
    playerUser,
    stats,
    login,
    isAnonymous,
    gameStats,
    loadStats,
    loadGameStats,
  };
});
