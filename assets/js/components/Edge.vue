<template>
  <EdgeContents
    v-if="embedded"
    :id="id"
    :src="src"
    :sprite-path="spritePath"
    :load="load"
    :invisible="invisible"
    :highlighted="highlighted"
    @loaded="$emit('loaded')"
    @open-book="$emit('open-book')"
  />
  <IssueEdgePopover
    v-else
    :id="`${id}-popover`"
    :has-edge="existing"
    :extra-points="popularity"
  >
    <template #title>
      <Issue
        :publicationcode="publicationCode"
        :issuenumber="issueNumber"
        :publicationname="publicationNames[publicationCode]"
      />
    </template>
    <EdgeContents
      :id="id"
      :src="src"
      :sprite-path="spritePath"
      :load="load"
      :invisible="invisible"
      :highlighted="highlighted"
      @loaded="$emit('loaded')"
      @open-book="$emit('open-book')"
    />
  </IssueEdgePopover>
</template>

<script setup>
import IssueEdgePopover from "./IssueEdgePopover";
import Issue from "./Issue";
import { coa } from "../stores/coa";
import { computed, ref } from "vue";
import EdgeContents from "./EdgeContents";

const EDGES_ROOT = "https://edges.ducksmanager.net/edges/";
const SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  publicationCode: {
    type: String,
    required: true,
  },
  issueNumber: {
    type: String,
    required: true,
  },
  issueNumberReference: {
    type: String,
    default: null,
  },
  creationDate: {
    type: String,
    default: null,
  },
  popularity: {
    type: Number,
    default: null,
  },
  spritePath: {
    type: String,
    default: null,
  },
  existing: {
    type: Boolean,
    required: true,
  },
  load: {
    type: Boolean,
    required: true,
  },
  invisible: {
    type: Boolean,
    default: false,
  },
  highlighted: {
    type: Boolean,
    default: false,
  },
  embedded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["loaded", "open-book"]);

const edge = ref(null),
  ignoreSprite = ref(false),
  publicationNames = computed(() => coa().publicationNames),
  countryCode = computed(() => props.publicationCode.split("/")[0]),
  magazineCode = computed(() => props.publicationCode.split("/")[1]),
  src = computed(() =>
    props.spritePath && !ignoreSprite.value
      ? `${SPRITES_ROOT}${props.spritePath}.png`
      : `${EDGES_ROOT}${countryCode.value}/gen/${magazineCode.value}.${
          props.issueNumberReference || props.issueNumber
        }.png?${new Date(props.creationDate).getTime()}`
  );
</script>

<style>
</style>
