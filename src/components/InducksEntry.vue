<template>
  <span>
    <b-dropdown
      v-if="editable"
      :text="storyversionKindText"
      class="mb-2"
      :toggle-class="{ [`kind-${kind}`]: true }"
      ><b-dropdown-item
        v-for="storyType of storyversionKinds"
        :key="storyType.value"
        :class="{ [`kind-${storyType.value}`]: true }"
        @click="
          update({
            ...entry,
            storyversion: { ...storyversion, kind: storyType.value },
          })
        "
        >{{ storyType.text }}</b-dropdown-item
      ></b-dropdown
    >
    <b-badge v-else size="xl" :class="{ [`kind-${kind}`]: true }">{{
      storyversionKindText || "?"
    }}</b-badge>
    {{ title || $t("Sans titre")
    }}<template v-if="part"> - {{ $t("partie") }} {{ part }}</template>
    <small>{{ comment }}</small>
    &nbsp;<a
      v-if="urlEncodedStorycode"
      target="_blank"
      :href="`https://coa.inducks.org/story.php?c=${urlEncodedStorycode}`"
    >
      {{ $t("Détails de l'histoire") }}
    </a>
  </span>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { StoryversionKind } from "~/stores/issueDetails";
import { issueDetails } from "~/stores/issueDetails";
import { Entry } from "~/stores/issueDetails";

const { t: $t } = useI18n();
const props = defineProps<{
  entryIndex: number;
  editable: boolean;
}>();

const entry = computed(() => issueDetails().entries[props.entryIndex]);

const storyversion = computed(() => entry.value.storyversion);
const storycode = computed(() => storyversion.value?.storycode);
const kind = computed(() => storyversion.value?.kind || "?");
const part = computed(() => entry.value.part);
const title = computed(() => entry.value.title || $t("Sans titre"));
const comment = computed(() => entry.value?.entrycomment);

const update = (entry: Entry) => {
  issueDetails().entries[props.entryIndex] = entry;
};

const urlEncodedStorycode = computed(
  () => storycode.value && encodeURIComponent(storycode.value)
);

const storyversionKindText = computed(() =>
  kind.value && storyversionKinds.value
    ? storyversionKinds.value.find(({ value }) => value === kind.value)?.text
    : ""
);
const storyversionKinds = computed(() =>
  Object.keys(StoryversionKind)
    .map((key) => ({
      value: getStoryversionKind(key as StoryversionKind),
      text: key as StoryversionKind,
    }))
    .sort((a, b) => a.text.localeCompare(b.text))
);

const getStoryversionKind = (storyversionKind: StoryversionKind) =>
  Object.values(StoryversionKind)[
    Object.keys(StoryversionKind).indexOf(storyversionKind)
  ];
</script>

<style scoped lang="scss">
:deep(.dropdown-menu) {
  background-color: white !important;
  overflow-x: visible !important;
}
.badge,
:deep(.dropdown-item) {
  width: max(100%, max-content);
}
.badge,
:deep(.btn-group .btn),
:deep(.dropdown-item) {
  color: black;
  background-color: white !important;

  &.kind-c {
    background-color: #ffcc33 !important;
  }

  &.kind-n {
    background-color: #cbdced !important;
  }

  &.kind-n_g {
    background-color: #ff99ff !important;
  }
}

.dark {
  color: black;
}
</style>
