<template>
  <EdgeContents
    v-if="embedded"
    :id="id"
    :src="src"
    :publicationcode="publicationcode"
    :issuenumber="issuenumber"
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
      <Issue
        :publicationcode="publicationcode"
        :issuenumber="issuenumber"
        :publicationname="publicationNames[publicationcode] || publicationcode"
      />
    </template>
    <EdgeContents
      :id="id"
      :src="src"
      :publicationcode="publicationcode"
      :issuenumber="issuenumber"
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
  issuenumber,
  issuenumberReference = null,
  publicationcode,
  spritePath = null,
  popularity = null,
  invisible = false,
  highlighted = false,
  embedded = false,
  orientation = "vertical",
} = defineProps<{
  id: string;
  publicationcode: string;
  issuenumber: string;
  issuenumberReference?: string;
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

const CLOUDINARY_ROTATED_URL =
  "https://res.cloudinary.com/dl7hskxab/image/upload/a_270/edges/";

const { publicationNames } = storeToRefs(coa());

let countryCode = $computed(() => publicationcode.split("/")[0]),
  magazineCode = $computed(() => publicationcode.split("/")[1]),
  src = $computed(() =>
    spritePath && !ignoreSprite
      ? `${SPRITES_ROOT}${spritePath}.png`
      : `${orientation === "vertical" ? import.meta.env.VITE_EDGES_ROOT : CLOUDINARY_ROTATED_URL}${countryCode}/gen/${magazineCode}.${(
          issuenumberReference || issuenumber
        ).replaceAll(
          " ",
          "",
        )}.png?${!creationDate ? "" : new Date(creationDate).getTime()}`,
  ),
  ignoreSprite = $ref(false);
</script>
