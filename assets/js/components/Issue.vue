<template>
  <div :class="{[`d-${noWrap ? 'inline' : 'block'}`]: true}">
    <a
      :class="{ clickable }"
      :href="`${$r(`/collection/show/{publicationCode:${publicationcode}}`)}#${issuenumber}`"
    >
      <Condition
        v-if="!hideCondition"
        :publicationcode="publicationcode"
        :issuenumber="issuenumber"
      />
      <Publication
        :publicationcode="publicationcode"
        :publicationname="publicationname"
      /> {{ issuenumber }}
    </a>
    <slot />
  </div>
</template>

<script>
import Publication from "./Publication";
import Condition from "./Condition";
import l10nMixin from "../mixins/l10nMixin";

export default {
  name: "Issue",
  components: {Condition, Publication},
  mixins: [l10nMixin],
  props: {
    publicationcode: {type: String, required: true},
    publicationname: {type: String, required: true},
    issuenumber: {type: String, required: true},
    clickable: { type: Boolean, default: false },
    hideCondition: { type: Boolean, default: false },
    noWrap: { type: Boolean, default: true }
  },
  computed: {
    imagePath: () => window.imagePath,
  },
}
</script>

<style scoped lang="scss">
  a {
    color: lightgrey;
    pointer-events: none;
    border-bottom: none;

    &.clickable {
      pointer-events: initial;
      border-bottom: initial;
    }
  }
</style>