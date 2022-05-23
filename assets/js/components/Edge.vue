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
    v-else-if="publicationNames"
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
import { coa } from "../stores/coa";
import EdgeContents from "./EdgeContents";
import Issue from "./Issue";
import IssueEdgePopover from "./IssueEdgePopover";

const EDGES_ROOT = "https://edges.ducksmanager.net/edges/",
  SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";
const {
    creationDate,
    issueNumber,
    issueNumberReference,
    publicationCode,
    spritePath,
  } = defineProps({
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
  }),
  emit = defineEmits(["loaded", "open-book"]);
let countryCode = $computed(() => publicationCode.split("/")[0]),
  magazineCode = $computed(() => publicationCode.split("/")[1]),
  src = $computed(() =>
    spritePath && !ignoreSprite
      ? `${SPRITES_ROOT}${spritePath}.png`
      : `${EDGES_ROOT}${countryCode}/gen/${magazineCode}.${
          issueNumberReference || issueNumber
        }.png?${new Date(creationDate).getTime()}`
  ),
  edge = $ref(null),
  ignoreSprite = $ref(false),
  publicationNames = $computed(() => coa().publicationNames);
</script>

<style>
</style>
