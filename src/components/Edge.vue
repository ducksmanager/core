<template>
  <EdgeContents
    v-if="embedded"
    :id="id"
    :src="src"
    :publication-code="publicationCode"
    :issue-number="issueNumber"
    :sprite-path="spritePath"
    :load="load"
    :invisible="invisible"
    :highlighted="highlighted"
    @loaded="$emit('loaded')"
    @open-book="$emit('open-book')"
    @ignore-sprite="ignoreSprite = true"
  />
  <IssueEdgePopover
    v-else-if="publicationNames"
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
      :publication-code="publicationCode"
      :issue-number="issueNumber"
      :sprite-path="spritePath"
      :load="load"
      :invisible="invisible"
      :highlighted="highlighted"
      @loaded="$emit('loaded')"
      @open-book="$emit('open-book')"
      @ignore-sprite="ignoreSprite = true"
    />
  </IssueEdgePopover>
</template>

<script setup lang="ts">
import { coa } from "~/stores/coa";

const EDGES_ROOT = "https://edges.ducksmanager.net/edges/",
  SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";
const {
  creationDate = null,
  issueNumber,
  issueNumberReference = null,
  publicationCode,
  spritePath = null,
  popularity = null,
  invisible = false,
  highlighted = false,
  embedded = false,
} = defineProps<{
  id: string;
  publicationCode: string;
  issueNumber: string;
  issueNumberReference?: string;
  creationDate?: string;
  popularity?: number;
  spritePath?: string;
  existing: boolean;
  load: boolean;
  invisible?: boolean;
  highlighted?: boolean;
  embedded?: boolean;
}>();

defineEmits<{ (e: "loaded"): void; (e: "open-book"): void }>();
let countryCode = $computed(() => publicationCode.split("/")[0]),
  magazineCode = $computed(() => publicationCode.split("/")[1]),
  src = $computed(() =>
    spritePath && !ignoreSprite
      ? `${SPRITES_ROOT}${spritePath}.png`
      : `${EDGES_ROOT}${countryCode}/gen/${magazineCode}.${
          issueNumberReference || issueNumber
        }.png?${!creationDate ? "" : new Date(creationDate).getTime()}`
  ),
  ignoreSprite = $ref(false),
  publicationNames = $computed(() => coa().publicationNames);
</script>

<style>
</style>
