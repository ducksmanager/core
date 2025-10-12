<template>
  <div class="duckguessr-game-interface">
    <!-- Top Navigation Bar -->
    <b-navbar
      variant="light"
      class="top-navbar px-0"
      :style="{ backgroundColor: '#FFB6C1' }"
    >
      <b-navbar-nav
        class="d-flex align-items-center w-100 justify-content-between"
      >
        <b-nav-item
          class="menu-button d-flex align-items-center justify-content-center"
          @click="$emit('menu-click')"
        >
          <BiList />
        </b-nav-item>
        <b-navbar-brand class="game-title">Duckguessr</b-navbar-brand>
        <b-nav-item
          class="profile-button d-flex align-items-center"
          @click="$emit('profile-click')"
        >
          <b-avatar :src="userAvatar" size="2rem" class="profile-avatar" />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Comic Panel -->
      <div class="comic-panel-container">
        <b-img :src="comicImage" alt="Comic panel" class="comic-image" fluid />
      </div>

      <!-- Timer/Progress Bar -->
      <div class="timer-section">
        <div class="timer-label">Your time!</div>
        <b-progress
          :value="timerProgress"
          :max="100"
          class="timer-progress"
          variant="warning"
        >
          <b-progress-bar
            :value="timerProgress"
            :variant="timerVariant"
            animated
          />
        </b-progress>
      </div>

      <!-- Card Slots Grid -->
      <div class="card-slots-section">
        <b-row class="g-2">
          <b-col
            v-for="(card, index) in cardSlots"
            :key="index"
            cols="4"
            class="d-flex"
          >
            <b-card
              :class="{ 'border-primary': card.filled }"
              class="w-100 aspect-ratio-1 cursor-pointer"
              @click="$emit('card-slot-click', index)"
            >
              <div
                v-if="card.filled"
                class="d-flex align-items-center justify-content-center h-100"
              >
                <b-img
                  v-if="card.image"
                  :src="card.image"
                  alt="Card"
                  fluid
                  rounded
                />
                <div v-else class="text-muted">
                  {{ card.text || "Card" }}
                </div>
              </div>
            </b-card>
          </b-col>
        </b-row>
      </div>

      <!-- Player Information -->
      <div class="players-section">
        <div class="players-label">Card</div>
        <div class="players-container">
          <b-card v-for="(player, index) in players" :key="index" class="mb-2">
            <div class="d-flex align-items-center mb-2">
              <b-avatar :src="player.avatar" size="1.5rem" class="me-2" />
              <div class="fw-bold">{{ player.name }}</div>
            </div>
            <b-progress
              :value="player.score"
              :max="100"
              variant="success"
              height="0.75rem"
            />
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CardSlot {
  filled: boolean;
  image?: string;
  text?: string;
}

interface Player {
  name: string;
  avatar: string;
  score: number;
}

interface Props {
  userAvatar?: string;
  comicImage?: string;
  timerProgress?: number;
  cardSlots?: CardSlot[];
  players?: Player[];
}

const {
  userAvatar = "/avatars/DD.png",
  comicImage = "/comics/scrooge-example.jpg",
  timerProgress = 15,
  cardSlots = Array(9).fill({ filled: false }),
  players = [
    { name: "Player 1", avatar: "/avatars/DD.png", score: 75 },
    { name: "Player 2", avatar: "/avatars/DD.png", score: 60 },
    { name: "Player 3", avatar: "/avatars/DD.png", score: 45 },
  ],
} = defineProps<Props>();

defineEmits<{
  (e: "menu-click"): void;
  (e: "profile-click"): void;
  (e: "card-slot-click", index: number): void;
}>();

const timerVariant = computed(() => {
  if (timerProgress <= 20) return "danger";
  if (timerProgress <= 40) return "warning";
  return "success";
});
</script>

<style lang="scss" scoped>
.duckguessr-game-interface {
  background-color: #dc3545;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-navbar {
  border-radius: 0.5rem;
  margin: 0.5rem;
  padding: 0.5rem 1rem;

  .game-title {
    font-weight: bold;
    color: #333;
    font-size: 1.2rem;
  }

  .menu-button,
  .profile-button {
    color: #333;
    border: none;
    cursor: pointer;

    &:hover {
      color: #666;
    }
  }

  .menu-button {
    padding: 0.25rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
}

.main-content {
  flex: 1;
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comic-panel-container {
  .comic-image {
    width: 100%;
    height: auto;
    border: 2px solid #333;
    border-radius: 0.5rem;
  }
}

.timer-section {
  .timer-label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: white;
  }

  .timer-progress {
    height: 1.5rem;
    border-radius: 0.75rem;
    background-color: rgba(255, 255, 255, 0.3);

    .progress-bar {
      border-radius: 0.75rem;
    }
  }
}

.card-slots-section {
  .aspect-ratio-1 {
    aspect-ratio: 1;
  }

  .cursor-pointer {
    cursor: pointer;
  }
}

.players-section {
  .players-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.5rem;
  }
}

// Mobile-first responsive design
@media (max-width: 576px) {
  .main-content {
    padding: 0 0.5rem 0.5rem;
    gap: 0.75rem;
  }

  .card-slots-section .card-slots-grid {
    gap: 0.25rem;
  }

  .players-section .players-container .player-card {
    padding: 0.5rem;
  }
}
</style>
