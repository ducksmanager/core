<template>
  <b-card id="edit-card" no-body>
    <b-tabs
      v-model="editingStepStore.stepNumber"
      lazy
      pills
      card
      nav-wrapper-class="col-auto h-100 m-0 p-0"
      nav-class="m-0 p-0"
      vertical
      content-class="col h-100"
    >
      <step-tab
        v-for="stepNumber of stepNumbers"
        :key="stepNumber"
        :step-number="stepNumber"
        @remove-step="emit('remove-step', stepNumber)"
        @duplicate-step="emit('duplicate-step', stepNumber)"
        @swap-steps="emit('swap-steps', [$event, stepNumber])"
      />
      <b-tab key="99" :title="$t('Add step')" title-item-class="fw-bold">
        <b-card-text>
          <b-dropdown :text="$t('Select a step type')">
            <b-dropdown-item
              v-for="renderName in Object.keys(supportedRenders) as (keyof typeof supportedRenders)[]"
              :key="renderName"
              @click="emit('add-step', renderName)"
            >
              {{ $t(supportedRenders[renderName].description) }}
            </b-dropdown-item>
          </b-dropdown>
        </b-card-text>
      </b-tab>
    </b-tabs>
  </b-card>
</template>
<script setup lang="ts">
import { editingStep } from "~/stores/editingStep";
import { renders } from "~/stores/renders";
import { step } from "~/stores/step";

const editingStepStore = editingStep();
const { supportedRenders } = renders();
const stepStore = step();

const emit = defineEmits<{
  (event: "swap-steps", steps: [number, number]): void;
  (event: "duplicate-step" | "remove-step", stepNumber: number): void;
  (event: "add-step", component: string): void;
}>();

const stepNumbers = computed(() =>
  Object.keys(stepStore.optionsPerStepNumber).map(Number),
);
</script>
<style lang="scss">
#edit-card {
  height: 100%;

  .tabs {
    height: 100%;

    ul {
      padding: 0;

      li {
        .action-icons {
          float: right;
        }

        svg {
          height: 15px;
          font-size: initial !important;
          vertical-align: middle;

          &.invisible {
            visibility: hidden;
          }

          &:first-of-type {
            margin-left: 5px;
          }
        }
      }
    }
  }
}

.nav {
  margin: 0 !important;
}
</style>
