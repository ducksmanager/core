import { defineStore } from "pinia";
import type { EventOutput } from "socket-call-client";

import { duckguessrSocketInjectionKey } from "~/composables/useDuckguessrSocket";

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

  const isAnonymous = computed(
    () => playerUser.value && /^user\d+$/.test(playerUser.value.username),
  );
  const login = () => {
    const { playerSocket } = inject(duckguessrSocketInjectionKey)!;
    playerSocket.getPlayer().then((player) => {
      playerUser.value = player;
    });
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
