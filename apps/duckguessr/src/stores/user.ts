import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { useCookies } from "@vueuse/integrations/useCookies";
import {
  isAnonymous as isAnonymousNative,
  removeCookie,
  setDuckguessrUserData,
  setUserCookieIfNotExists,
} from "~/composables/user";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "~types/socketEvents";
import {
  MedalLevel,
  UserGameMedalPoints,
  UserMedalPoints,
} from "~types/playerStats";
import { player } from "~duckguessr-api/types/prisma-client";

export const MEDAL_LEVELS: MedalLevel[] = [
  { medalType: "fast", levels: [25, 150, 500] },
  { medalType: "ultra_fast", levels: [10, 50, 200] },
  { medalType: "published-fr-recent", levels: [10, 75, 300] },
  { medalType: "it", levels: [10, 75, 300] },
  { medalType: "us", levels: [10, 75, 300] },
];

export const userStore = defineStore("user", () => {
  const loginSocket = ref(
    null as Socket<ServerToClientEvents, ClientToServerEvents> | null,
  );
  const user = ref(null as player | null);
  const stats = ref(null as UserMedalPoints[] | null);
  const gameStats = ref(null as UserGameMedalPoints[] | null);
  const attempts = ref(0 as number);

  const isAnonymous = computed(
    () => user.value && isAnonymousNative(user.value.username),
  );
  const login = () => {
    loginSocket.value = io(`${import.meta.env.VITE_DM_SOCKET_URL}/login`, {
      auth: {
        cookie: useCookies().getAll(),
      },
    })
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
    loginSocket.value!.emit("getStats", null, (newStats) => {
      stats.value = newStats;
    });
  };
  const loadGameStats = (
    gameId: number,
    currentGameDatasetName: string | null,
    isWinningPlayer: boolean,
  ) => {
    loginSocket.value!.emit("getGameStats", gameId, (stats) => {
      gameStats.value = stats;
      if (currentGameDatasetName) {
        gameStats.value!.push({
          medalType: currentGameDatasetName,
          gameId,
          playerId: user.value!.id,
          points: isWinningPlayer ? 1 : 0,
        });
      }
    });
  };

  return {
    user,
    stats,
    login,
    loginSocket,
    isAnonymous,
    gameStats,
    loadStats,
    loadGameStats,
  };
});
