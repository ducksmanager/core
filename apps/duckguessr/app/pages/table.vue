<template>
  <div id="container" :class="{ 'player-view': mode === 'player' }">
    <div
      class="position-absolute w-100"
      style="top: 10px; left: 10px; text-align: center"
    >
      <input
        type="checkbox"
        id="mode"
        :checked="mode === 'player'"
        @change="mode = mode === 'player' ? 'top' : 'player'"
      />
      <label for="mode">Player View</label>
    </div>
    <article
      class="board"
      :style="{
        '--total-players': players.length,
        '--total-cards': cards.length,
      }"
    >
      <div
        class="player-position"
        v-for="(player, index) in players"
        :key="player.id"
        :style="{ '--index': index + 1 }"
      >
        <player-info v-bind="player" />
      </div>
      <div id="cards">
        <button
          class="card"
          :class="{ flipped: card.flipped }"
          @click="card.flipped = !card.flipped"
          v-for="card in cards"
          :key="card.id"
        >
          <span class="wrapper"
            ><span class="content">
              <span class="face back"></span>
              <span class="face front"></span>
            </span>
          </span>
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const players = [
  {
    id: 1,
    username: "Player 1",
    score: 100,
    avatar: "DD",
  },
  {
    id: 2,
    username: "Player 2",
    score: 90,
    avatar: "DD",
  },
  {
    id: 3,
    username: "Player 3",
    score: 80,
    avatar: "DD",
  },
] as const;

const mode = ref<"top" | "player">("top");
const cards = ref([
  { id: 1, flipped: false },
  { id: 2, flipped: false },
  { id: 3, flipped: false },
]);
</script>

<style lang="scss">
@use "sass:math";

$card-space: 3px;
$fan-angle: 40deg;
$max-cards: 3; // Maximum number of cards to style
$card-aspect-ratio: 20/29;

$card-aspect-ratio-squared: $card-aspect-ratio * $card-aspect-ratio;
$card-diagonal-factor: math.sqrt(1 + $card-aspect-ratio-squared) / 2;

#container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  perspective: 1000px;

  &.player-view {
    .board {
      transform: rotateX(75deg);
    }
  }
}

.board {
  --board-size: calc(100vh - 100px);
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
  --avatar-size-px: 64px; // from PlayerInfo
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
  padding-top: 15px;
  padding-left: 54px;
  offset-path: circle(var(--player-radius));
  offset-distance: calc(
    26% + (var(--index) - 1) * (100% / v-bind("players.length"))
  );
  offset-rotate: 0deg;
}

#cards {
  --card-width: min(200px, 20vmin);
  --card-diagonal: calc(var(--card-width) * #{$card-diagonal-factor});

  position: absolute;
  bottom: calc(var(--card-diagonal) + 30px);
  left: 50%;
  transform: translate(-50%, -50%);

  .card {
    --duration: 1200ms;
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--card-width);
    aspect-ratio: #{$card-aspect-ratio};
    outline: none;
    border: none;
    cursor: pointer;
    padding: 0;
    background-color: transparent;
    transition: all 200ms;
    pointer-events: none;
    transform-origin: bottom left; // Rotate from bottom left corner
    --fan-angle: #{$fan-angle};

    @each $i in (1, 2, 3) {
      &:nth-of-type(#{$i}) {
        $card-index: $i - 1;
        $z-offset: $i * $card-space;

        $numerator: $card-index * $fan-angle;
        $offset: $fan-angle / 2;

        --rotation: calc(#{$numerator} / (var(--total-cards) - 1) - #{$offset});

        transform: translate(-50%, -50%)
          translateZ(#{$z-offset})
          rotateZ(var(--rotation));
      }
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
}

.front {
  transform: rotateY(0.5turn);
  border-width: 1px 0px;
  border-color: black;
  border-style: solid;

  .card:nth-of-type(1) & {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/English_pattern_ace_of_spades.svg/1024px-English_pattern_ace_of_spades.svg.png");
  }
  .card:nth-of-type(2) & {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/English_pattern_2_of_spades.svg/1024px-English_pattern_2_of_spades.svg.png");
  }
  .card:nth-of-type(3) & {
    background-image: url("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/English_pattern_3_of_spades.svg/1024px-English_pattern_3_of_spades.svg.png");
  }
}

.back {
  background-image: url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkKnlurWcUYrlDbGvf8IUz6rLX7oX1hHt7FW_6e4vNOwFfPhmPURXxGK45qVAqW7dtxsY&usqp=CAU");
  border: 1px solid black;
}

.card.flipped {
  @each $i in (1, 2, 3) {
    &:nth-of-type(#{$i}) {
      $card-index: $i - 1;
      $z-offset: (4 - $i) * $card-space;

      $numerator: $card-index * $fan-angle;
      $offset: $fan-angle / 2;

      --rotation: calc(#{$numerator} / (var(--total-cards) - 1) - #{$offset});

      transform: translate(-50%, -50%)
        translateZ(#{$z-offset})
        rotateZ(var(--rotation));
    }
  }

  .wrapper {
    transform: rotateY(0.5turn);
  }
}
</style>
