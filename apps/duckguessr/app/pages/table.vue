<template>
  <DefineTemplate v-slot="{ id, flipped, played, personcode }">
    <button
      class="card"
      :class="{ flipped, played }"
      @click="
        players[0].cards.find((card) => card.id === id)!.flipped = true;
        players[0].cards.find((card) => card.id === id)!.played = true;
      "
    >
      <span class="wrapper"
        ><span class="content">
          <span class="face back"></span>
          <span
            class="face front"
            :style="{
              backgroundImage: `url('https://inducks.org/creators/photos/${personcode}.jpg')`,
            }"
          ></span>
        </span>
      </span>
    </button>
  </DefineTemplate>
  <div id="container">
    <div id="progress-container">
      <b-progress :value="progress" :max="100" />
    </div>
    <article
      class="board"
      :style="{
        '--total-players': players.length,
        '--total-cards': players[0].cards.length,
      }"
    >
      <img
        :src="`${CLOUDINARY_URL_ROOT}/thumbnails3/webusers/2008/09/us_zz1966b23x_001.jpg`"
      />
      <div
        class="player-position"
        v-for="(player, index) in players"
        :key="player.id"
        v-show="player.id !== 1"
        :style="{ '--index': index + 1 }"
      >
        <game-player-info
          v-bind="player"
          :has-played="player.cards.some((card) => card.played)"
        >
          <template #cards>
            <div class="cards other-player">
              <ReuseTemplate
                v-for="card in player.cards"
                :key="card.id"
                :id="card.id"
                :flipped="card.flipped"
                :played="card.played"
                :personcode="card.personcode"
              />
            </div>
          </template>
        </game-player-info>
      </div>
      <div class="cards">
        <ReuseTemplate
          v-for="card in players[0].cards"
          :key="card.id"
          :id="card.id"
          :flipped="card.flipped"
          :played="card.played"
          :personcode="card.personcode"
        />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const CLOUDINARY_URL_ROOT = import.meta.env.VITE_CLOUDINARY_URL_ROOT;

const progress = ref(0);

const [DefineTemplate, ReuseTemplate] = createReusableTemplate({
  props: {
    id: Number,
    flipped: Boolean,
    played: Boolean,
    personcode: String,
  },
});

const players = ref([
  {
    id: 1,
    username: "Player 1",
    score: 100,
    avatar: "DD",
    cards: [
      { id: 1, personcode: "DR", flipped: false, played: false },
      { id: 2, personcode: "CB", flipped: false, played: false },
      { id: 3, personcode: "GCa", flipped: false, played: false },
    ],
  },
  {
    id: 2,
    username: "Player 2",
    score: 90,
    avatar: "DD",
    cards: [
      { id: 1, personcode: "DR", flipped: true, played: false },
      { id: 2, personcode: "CB", flipped: true, played: false },
      { id: 3, personcode: "GCa", flipped: true, played: false },
    ],
  },
  {
    id: 3,
    username: "Player 3",
    score: 80,
    avatar: "DD",
    cards: [
      { id: 1, personcode: "DR", flipped: true, played: false },
      { id: 2, personcode: "CB", flipped: true, played: false },
      { id: 3, personcode: "GCa", flipped: true, played: false },
    ],
  },
]);

onMounted(() => {
  setInterval(() => {
    progress.value = Math.min(progress.value + 10, 100);
    if (progress.value === 20) {
      players.value[1].cards[0].played = true;
    }
    if (progress.value === 70) {
      players.value[2].cards[0].played = true;
    }
    if (progress.value === 100) {
      for (const player of players.value) {
        for (const card of player.cards) {
          players.value[player.id - 1].cards[card.id - 1].flipped = false;
        }
      }
    }
  }, 1000);
});
</script>

<style lang="scss">
@use "sass:math";

$card-space: 3px;

$max-cards: 3; // Maximum number of cards to style
$card-aspect-ratio: math.div(20, 29);

$card-aspect-ratio-squared: $card-aspect-ratio * $card-aspect-ratio;
$card-diagonal-factor: math.div(math.sqrt(1 + $card-aspect-ratio-squared), 2);

#container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  perspective: 1000px;

  --board-size: calc(100vh - 100px);

  #progress-container {
    position: absolute;
    width: 100%;
    top: 0;
    padding: 10px;

    display: flex;
    justify-content: center;
    align-items: center;

    .progress {
      width: var(--board-size);
    }
  }

  .board {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--board-size);
    width: var(--board-size);
    box-sizing: border-box;
    border: 4px solid black;
    border-radius: 50%;
    padding: 1rem 3rem;
    background: hsl(201deg, 100%, 32%);
    --board-half-size: calc(var(--board-size) / 2);
    --table-outer-radius: var(--board-half-size);
    --avatar-size-px: 64px; // from GamePlayerInfo
    --avatar-radius-px: calc(var(--avatar-size-px) / 2);
    --player-radius: var(--table-outer-radius);
  }

  .board,
  .card,
  .wrapper,
  .content {
    transform-style: preserve-3d;
  }

  .board > .player-position {
    position: absolute;
    offset-path: circle(var(--player-radius));
    offset-distance: calc(
      25% + (var(--index) - 1) * (100% / v-bind("players.length"))
    );
    offset-rotate: 0deg;

    &:nth-of-type(2) {
      .cards.other-player {
        .card.flipped.played {
          transform: translateY(90px) translateX(90px) rotateY(0.5turn) scale(2);
        }
        .card.played {
          transform: translateY(90px) translateX(90px) scale(2);
        }
      }
    }

    &:nth-of-type(3) {
      .cards.other-player {
        .card.flipped.played {
          transform: translateY(90px) translateX(-90px) rotateY(0.5turn)
            scale(2);
        }
        .card.played {
          transform: translateY(90px) translateX(-90px) scale(2);
        }
      }
    }
  }

  .cards {
    --card-width: min(200px, 12vmin);

    &.other-player {
      top: 10px;
      left: 10px;
      --card-width: min(200px, 4vmin);

      .card {
        position: absolute;
      }
    }
    --card-diagonal: calc(var(--card-width) * #{$card-diagonal-factor});

    position: absolute;
    display: flex;
    gap: 10px;
    bottom: -50px;

    .card {
      --duration: 1200ms;
      width: var(--card-width);
      aspect-ratio: #{$card-aspect-ratio};
      outline: none;
      border: none;
      cursor: pointer;
      padding: 0;
      background-color: transparent;
      transition: all 200ms;
      pointer-events: none;

      &.flipped.played {
        transform: translateY(-90px) rotateY(0.5turn) scale(0.7);
      }

      &.played {
        transform: translateY(-90px) scale(0.7);
      }

      &.flipped {
        transform: rotateY(0.5turn);
        @each $i in (1, 2, 3) {
          &:nth-of-type(#{$i}) {
            $card-index: $i - 1;
            $z-offset: (4 - $i) * $card-space;
          }
        }
      }

      .wrapper {
        pointer-events: initial;
        display: block;
        position: relative;
        height: 100%;
        transition: all var(--duration) ease-out;
        transform-origin: 200% 50%;
      }

      .content {
        display: block;
        height: 100%;
        transition: all var(--duration);
      }

      .face {
        transition: transform calc(var(--duration) * 3 / 4);
        transition-delay: calc(var(--duration) / 6);
        position: absolute;
        inset: 0;
        backface-visibility: hidden;
        border-radius: calc(var(--card-width) / 20);
        background-size: cover;
        background-position: center;
        background-color: white;

        &.back {
          transform: rotateY(0.5turn);
          border-width: 1px 0px;
          border-color: black;
          border-style: solid;
          background-image: url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkKnlurWcUYrlDbGvf8IUz6rLX7oX1hHt7FW_6e4vNOwFfPhmPURXxGK45qVAqW7dtxsY&usqp=CAU");
        }

        &.front {
          border: 1px solid black;
        }
      }
    }
  }
}
</style>
