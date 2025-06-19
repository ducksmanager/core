<template>
  <slot v-if="$slots['edge-prefix']" name="edge-prefix" />
  <EdgeContents
    v-if="embedded"
    :id="id"
    :src="src"
    :issuecode="issuecode"
    :sprite-path="spritePath"
    :invisible="invisible"
    :highlighted="highlighted"
    :orientation="orientation"
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
      <Issue :issuecode="issuecode" />
    </template>
    <EdgeContents
      :id="id"
      :src="src"
      :issuecode="issuecode"
      :sprite-path="spritePath"
      :invisible="invisible"
      :highlighted="highlighted"
      :orientation="orientation"
      @loaded="$emit('loaded')"
      @open-book="$emit('open-book')"
      @ignore-sprite="ignoreSprite = true"
    />
  </IssueEdgePopover>
</template>

<script setup lang="ts">
const SPRITES_ROOT = "https://res.cloudinary.com/dl7hskxab/image/sprite/";
const {
  creationDate = null,
  issuecode,
  spritePath = null,
  popularity = null,
  invisible = false,
  highlighted = false,
  embedded = false,
  orientation = "vertical",
} = defineProps<{
  id: string;
  issuecode: string;
  creationDate?: string;
  popularity?: number | null;
  spritePath?: string | null;
  existing: boolean;
  invisible?: boolean;
  highlighted?: boolean;
  embedded?: boolean;
  orientation?: "horizontal" | "vertical";
}>();

defineEmits<{ (e: "loaded"): void; (e: "open-book"): void }>();

defineSlots<{
  "edge-prefix"(): never;
}>();

const CLOUDINARY_ROTATED_URL =
  "https://res.cloudinary.com/dl7hskxab/image/upload/a_90/edges/";

const { publicationNames, issuecodeDetails } = storeToRefs(coa());

let src = $computed(() => {
    const { publicationcode, issuenumber } = issuecodeDetails.value[issuecode];
    const [countrycode, magazineCode] = publicationcode.split("/");
    return spritePath && !ignoreSprite
      ? `${SPRITES_ROOT}${spritePath}.png`
      : `${orientation === "vertical" ? import.meta.env.VITE_EDGES_ROOT : CLOUDINARY_ROTATED_URL}${countrycode}/gen/${magazineCode}.${issuenumber.replaceAll(
          " ",
          "",
        )}.png?${creationDate ? new Date(creationDate).getTime() : "default"}`;
  }),
  ignoreSprite = $ref(false);
</script>
